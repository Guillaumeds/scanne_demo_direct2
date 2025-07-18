

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;




ALTER SCHEMA "public" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_comprehensive_bloc_data"("p_bloc_id" "uuid") RETURNS TABLE("bloc_id" "uuid", "crop_cycles" "jsonb", "field_operations" "jsonb", "work_packages" "jsonb", "products" "jsonb", "labour" "jsonb", "equipment" "jsonb", "last_updated" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    p_bloc_id as bloc_id,
    
    -- Crop cycles for this bloc
    (SELECT jsonb_agg(to_jsonb(cc.*)) FROM (
      SELECT 
        cc.*,
        sv.name as sugarcane_variety_name,
        iv.name as intercrop_variety_name
      FROM crop_cycles cc
      LEFT JOIN sugarcane_varieties sv ON cc.sugarcane_variety_id = sv.id
      LEFT JOIN intercrop_varieties iv ON cc.intercrop_variety_id = iv.id
      WHERE cc.bloc_id = p_bloc_id
      ORDER BY cc.created_at DESC
    ) cc) as crop_cycles,
    
    -- Field operations for this bloc's crop cycles
    (SELECT jsonb_agg(to_jsonb(fo.*)) FROM (
      SELECT fo.*
      FROM field_operations fo
      JOIN crop_cycles cc ON fo.crop_cycle_uuid = cc.id
      WHERE cc.bloc_id = p_bloc_id
      ORDER BY fo.planned_start_date DESC NULLS LAST, fo.created_at DESC
    ) fo) as field_operations,
    
    -- Work packages for this bloc's operations
    (SELECT jsonb_agg(to_jsonb(wp.*)) FROM (
      SELECT wp.*
      FROM daily_work_packages wp
      JOIN field_operations fo ON wp.field_operation_uuid = fo.uuid
      JOIN crop_cycles cc ON fo.crop_cycle_uuid = cc.id
      WHERE cc.bloc_id = p_bloc_id
      ORDER BY wp.work_date DESC, wp.created_at DESC
    ) wp) as work_packages,
    
    -- Products used in this bloc
    (SELECT jsonb_agg(to_jsonb(p.*)) FROM (
      SELECT DISTINCT p.*
      FROM products p
      WHERE p.active = true
      ORDER BY p.name
    ) p) as products,
    
    -- Labour used in this bloc
    (SELECT jsonb_agg(to_jsonb(l.*)) FROM (
      SELECT DISTINCT l.*
      FROM labour l
      WHERE l.active = true
      ORDER BY l.name
    ) l) as labour,
    
    -- Equipment used in this bloc
    (SELECT jsonb_agg(to_jsonb(e.*)) FROM (
      SELECT DISTINCT e.*
      FROM equipment e
      WHERE e.active = true
      ORDER BY e.name
    ) e) as equipment,
    
    NOW() as last_updated;
END;
$$;


ALTER FUNCTION "public"."get_comprehensive_bloc_data"("p_bloc_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_farm_gis_initial_data"() RETURNS TABLE("blocs" "jsonb", "farms" "jsonb", "companies" "jsonb", "active_crop_cycles" "jsonb")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- All active blocs with WKT coordinates
    (SELECT jsonb_agg(to_jsonb(b.*)) FROM (
      SELECT
        id,
        name,
        area_hectares,
        ST_AsText(coordinates) as coordinates_wkt,
        status,
        farm_id,
        created_at,
        updated_at
      FROM blocs
      WHERE status = 'active'
      ORDER BY created_at DESC
    ) b) as blocs,

    -- All farms
    (SELECT jsonb_agg(to_jsonb(f.*)) FROM (
      SELECT * FROM farms ORDER BY created_at ASC
    ) f) as farms,

    -- All companies
    (SELECT jsonb_agg(to_jsonb(c.*)) FROM (
      SELECT * FROM companies ORDER BY created_at ASC
    ) c) as companies,

    -- Active crop cycles with variety info
    (SELECT jsonb_agg(to_jsonb(cc.*)) FROM (
      SELECT 
        cc.*,
        sv.name as sugarcane_variety_name,
        iv.name as intercrop_variety_name,
        b.name as bloc_name
      FROM crop_cycles cc
      LEFT JOIN sugarcane_varieties sv ON cc.sugarcane_variety_id = sv.id
      LEFT JOIN intercrop_varieties iv ON cc.intercrop_variety_id = iv.id
      LEFT JOIN blocs b ON cc.bloc_id = b.id
      WHERE cc.status = 'active'
      ORDER BY cc.created_at DESC
    ) cc) as active_crop_cycles;
END;
$$;


ALTER FUNCTION "public"."get_farm_gis_initial_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."blocs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "area_hectares" numeric(10,2),
    "coordinates" "public"."geometry"(Polygon,4326),
    "status" character varying(50) DEFAULT 'active'::character varying,
    "farm_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."blocs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."climatic_data" (
    "station_id" "text" NOT NULL,
    "observation_year" bigint NOT NULL,
    "observation_month" bigint,
    "observation_day" bigint,
    "julian_day" bigint NOT NULL,
    "temperature_min_celsius" double precision,
    "temperature_max_celsius" double precision,
    "solar_radiation_mj_per_m2" double precision,
    "evapotranspiration_mm" double precision,
    "precipitation_mm" double precision,
    "wind_speed_m_per_s" double precision,
    "vapor_pressure_hpa" double precision,
    "co2_concentration_ppm" double precision
);


ALTER TABLE "public"."climatic_data" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."companies" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."companies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."crop_cycles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "bloc_id" "uuid" NOT NULL,
    "type" character varying(50) NOT NULL,
    "cycle_number" integer DEFAULT 1 NOT NULL,
    "status" character varying(50) DEFAULT 'active'::character varying,
    "sugarcane_variety_id" "uuid",
    "intercrop_variety_id" "uuid",
    "planting_date" "date",
    "expected_harvest_date" "date",
    "actual_harvest_date" "date",
    "expected_yield_tons" numeric(10,2),
    "actual_yield_tons" numeric(10,2),
    "total_planned_cost" numeric(12,2) DEFAULT 0,
    "total_actual_cost" numeric(12,2) DEFAULT 0,
    "total_planned_hours" numeric(10,2) DEFAULT 0,
    "total_actual_hours" numeric(10,2) DEFAULT 0,
    "days_since_planting" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "crop_cycles_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['active'::character varying, 'closed'::character varying])::"text"[]))),
    CONSTRAINT "crop_cycles_type_check" CHECK ((("type")::"text" = ANY ((ARRAY['plantation'::character varying, 'ratoon'::character varying])::"text"[])))
);


ALTER TABLE "public"."crop_cycles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."daily_work_packages" (
    "uuid" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "field_operation_uuid" "uuid" NOT NULL,
    "package_name" character varying(255),
    "work_date" "date" NOT NULL,
    "shift" character varying(20) DEFAULT 'day'::character varying,
    "planned_area_hectares" numeric(10,2),
    "planned_quantity" numeric(10,2),
    "actual_area_hectares" numeric(10,2),
    "actual_quantity" numeric(10,2),
    "weather_conditions" character varying(255),
    "soil_conditions" character varying(255),
    "status" character varying(50) DEFAULT 'planned'::character varying,
    "supervisor_notes" "text",
    "completion_percentage" numeric(5,2) DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "daily_work_packages_shift_check" CHECK ((("shift")::"text" = ANY ((ARRAY['day'::character varying, 'night'::character varying])::"text"[]))),
    CONSTRAINT "daily_work_packages_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['planned'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'cancelled'::character varying])::"text"[])))
);


ALTER TABLE "public"."daily_work_packages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."equipment" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "equipment_id" character varying(100) NOT NULL,
    "name" character varying(255) NOT NULL,
    "category" character varying(100),
    "hourly_rate" numeric(10,2) DEFAULT 0,
    "description" "text",
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."equipment" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."farms" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "company_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."farms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."field_operations" (
    "uuid" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "crop_cycle_uuid" "uuid" NOT NULL,
    "operation_name" character varying(255) NOT NULL,
    "operation_type" character varying(100) NOT NULL,
    "method" character varying(100),
    "priority" character varying(20) DEFAULT 'normal'::character varying,
    "planned_start_date" "date",
    "planned_end_date" "date",
    "planned_area_hectares" numeric(10,2),
    "planned_quantity" numeric(10,2),
    "estimated_total_cost" numeric(12,2) DEFAULT 0,
    "actual_start_date" "date",
    "actual_end_date" "date",
    "actual_area_hectares" numeric(10,2),
    "actual_quantity" numeric(10,2),
    "actual_total_cost" numeric(12,2),
    "status" character varying(50) DEFAULT 'planned'::character varying,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "field_operations_priority_check" CHECK ((("priority")::"text" = ANY ((ARRAY['low'::character varying, 'normal'::character varying, 'high'::character varying])::"text"[]))),
    CONSTRAINT "field_operations_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['planned'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'cancelled'::character varying])::"text"[])))
);


ALTER TABLE "public"."field_operations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."intercrop_varieties" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."intercrop_varieties" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."labour" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "labour_id" character varying(100) NOT NULL,
    "name" character varying(255) NOT NULL,
    "category" character varying(100),
    "unit" character varying(50),
    "cost_per_unit" numeric(10,2) DEFAULT 0,
    "description" "text",
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."labour" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."operation_equipment" (
    "uuid" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "field_operation_uuid" "uuid" NOT NULL,
    "equipment_uuid" "uuid" NOT NULL,
    "planned_hours" numeric(10,2) DEFAULT 0 NOT NULL,
    "planned_cost" numeric(10,2) DEFAULT 0 NOT NULL,
    "actual_hours" numeric(10,2),
    "actual_cost" numeric(10,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."operation_equipment" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."operation_labour" (
    "uuid" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "field_operation_uuid" "uuid" NOT NULL,
    "labour_uuid" "uuid" NOT NULL,
    "planned_quantity" numeric(10,2) DEFAULT 0 NOT NULL,
    "planned_cost" numeric(10,2) DEFAULT 0 NOT NULL,
    "actual_quantity" numeric(10,2),
    "actual_cost" numeric(10,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."operation_labour" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."operation_products" (
    "uuid" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "field_operation_uuid" "uuid" NOT NULL,
    "product_uuid" "uuid" NOT NULL,
    "planned_quantity" numeric(10,2) DEFAULT 0 NOT NULL,
    "planned_cost" numeric(10,2) DEFAULT 0 NOT NULL,
    "actual_quantity" numeric(10,2),
    "actual_cost" numeric(10,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."operation_products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."operation_type_config" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "operation_type" character varying(100) NOT NULL,
    "display_name" character varying(255) NOT NULL,
    "description" "text",
    "ordr" integer DEFAULT 0,
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."operation_type_config" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."operations_method" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "method" character varying(100) NOT NULL,
    "display_name" character varying(255) NOT NULL,
    "description" "text",
    "ordr" integer DEFAULT 0,
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."operations_method" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "product_id" character varying(100) NOT NULL,
    "name" character varying(255) NOT NULL,
    "category" character varying(100),
    "subcategory" character varying(100),
    "unit" character varying(50),
    "cost_per_unit" numeric(10,2) DEFAULT 0,
    "description" "text",
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sugarcane_varieties" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sugarcane_varieties" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."work_package_equipment" (
    "uuid" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "daily_work_package_uuid" "uuid" NOT NULL,
    "equipment_uuid" "uuid" NOT NULL,
    "planned_hours" numeric(10,2) DEFAULT 0 NOT NULL,
    "planned_cost" numeric(10,2) DEFAULT 0 NOT NULL,
    "actual_hours" numeric(10,2),
    "actual_cost" numeric(10,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."work_package_equipment" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."work_package_labour" (
    "uuid" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "daily_work_package_uuid" "uuid" NOT NULL,
    "labour_uuid" "uuid" NOT NULL,
    "planned_quantity" numeric(10,2) DEFAULT 0 NOT NULL,
    "planned_cost" numeric(10,2) DEFAULT 0 NOT NULL,
    "actual_quantity" numeric(10,2),
    "actual_cost" numeric(10,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."work_package_labour" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."work_package_products" (
    "uuid" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "daily_work_package_uuid" "uuid" NOT NULL,
    "product_uuid" "uuid" NOT NULL,
    "planned_quantity" numeric(10,2) DEFAULT 0 NOT NULL,
    "planned_cost" numeric(10,2) DEFAULT 0 NOT NULL,
    "actual_quantity" numeric(10,2),
    "actual_cost" numeric(10,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."work_package_products" OWNER TO "postgres";


ALTER TABLE ONLY "public"."blocs"
    ADD CONSTRAINT "blocs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."climatic_data"
    ADD CONSTRAINT "climatic_data_pkey" PRIMARY KEY ("station_id", "observation_year", "julian_day");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."crop_cycles"
    ADD CONSTRAINT "crop_cycles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."daily_work_packages"
    ADD CONSTRAINT "daily_work_packages_pkey" PRIMARY KEY ("uuid");



ALTER TABLE ONLY "public"."equipment"
    ADD CONSTRAINT "equipment_equipment_id_key" UNIQUE ("equipment_id");



ALTER TABLE ONLY "public"."equipment"
    ADD CONSTRAINT "equipment_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."farms"
    ADD CONSTRAINT "farms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."field_operations"
    ADD CONSTRAINT "field_operations_pkey" PRIMARY KEY ("uuid");



ALTER TABLE ONLY "public"."intercrop_varieties"
    ADD CONSTRAINT "intercrop_varieties_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."labour"
    ADD CONSTRAINT "labour_labour_id_key" UNIQUE ("labour_id");



ALTER TABLE ONLY "public"."labour"
    ADD CONSTRAINT "labour_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."operation_equipment"
    ADD CONSTRAINT "operation_equipment_pkey" PRIMARY KEY ("uuid");



ALTER TABLE ONLY "public"."operation_labour"
    ADD CONSTRAINT "operation_labour_pkey" PRIMARY KEY ("uuid");



ALTER TABLE ONLY "public"."operation_products"
    ADD CONSTRAINT "operation_products_pkey" PRIMARY KEY ("uuid");



ALTER TABLE ONLY "public"."operation_type_config"
    ADD CONSTRAINT "operation_type_config_operation_type_key" UNIQUE ("operation_type");



ALTER TABLE ONLY "public"."operation_type_config"
    ADD CONSTRAINT "operation_type_config_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."operations_method"
    ADD CONSTRAINT "operations_method_method_key" UNIQUE ("method");



ALTER TABLE ONLY "public"."operations_method"
    ADD CONSTRAINT "operations_method_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_product_id_key" UNIQUE ("product_id");



ALTER TABLE ONLY "public"."sugarcane_varieties"
    ADD CONSTRAINT "sugarcane_varieties_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."work_package_equipment"
    ADD CONSTRAINT "work_package_equipment_pkey" PRIMARY KEY ("uuid");



ALTER TABLE ONLY "public"."work_package_labour"
    ADD CONSTRAINT "work_package_labour_pkey" PRIMARY KEY ("uuid");



ALTER TABLE ONLY "public"."work_package_products"
    ADD CONSTRAINT "work_package_products_pkey" PRIMARY KEY ("uuid");



CREATE INDEX "idx_blocs_farm_id" ON "public"."blocs" USING "btree" ("farm_id");



CREATE INDEX "idx_blocs_status" ON "public"."blocs" USING "btree" ("status");



CREATE INDEX "idx_crop_cycles_bloc_id" ON "public"."crop_cycles" USING "btree" ("bloc_id");



CREATE INDEX "idx_crop_cycles_status" ON "public"."crop_cycles" USING "btree" ("status");



CREATE INDEX "idx_daily_work_packages_date" ON "public"."daily_work_packages" USING "btree" ("work_date");



CREATE INDEX "idx_daily_work_packages_operation" ON "public"."daily_work_packages" USING "btree" ("field_operation_uuid");



CREATE INDEX "idx_equipment_active" ON "public"."equipment" USING "btree" ("active");



CREATE INDEX "idx_field_operations_crop_cycle" ON "public"."field_operations" USING "btree" ("crop_cycle_uuid");



CREATE INDEX "idx_field_operations_status" ON "public"."field_operations" USING "btree" ("status");



CREATE INDEX "idx_labour_active" ON "public"."labour" USING "btree" ("active");



CREATE INDEX "idx_products_active" ON "public"."products" USING "btree" ("active");



CREATE OR REPLACE TRIGGER "update_blocs_updated_at" BEFORE UPDATE ON "public"."blocs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_companies_updated_at" BEFORE UPDATE ON "public"."companies" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_crop_cycles_updated_at" BEFORE UPDATE ON "public"."crop_cycles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_daily_work_packages_updated_at" BEFORE UPDATE ON "public"."daily_work_packages" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_farms_updated_at" BEFORE UPDATE ON "public"."farms" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_field_operations_updated_at" BEFORE UPDATE ON "public"."field_operations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."blocs"
    ADD CONSTRAINT "blocs_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."crop_cycles"
    ADD CONSTRAINT "crop_cycles_bloc_id_fkey" FOREIGN KEY ("bloc_id") REFERENCES "public"."blocs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."crop_cycles"
    ADD CONSTRAINT "crop_cycles_intercrop_variety_id_fkey" FOREIGN KEY ("intercrop_variety_id") REFERENCES "public"."intercrop_varieties"("id");



ALTER TABLE ONLY "public"."crop_cycles"
    ADD CONSTRAINT "crop_cycles_sugarcane_variety_id_fkey" FOREIGN KEY ("sugarcane_variety_id") REFERENCES "public"."sugarcane_varieties"("id");



ALTER TABLE ONLY "public"."daily_work_packages"
    ADD CONSTRAINT "daily_work_packages_field_operation_uuid_fkey" FOREIGN KEY ("field_operation_uuid") REFERENCES "public"."field_operations"("uuid") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."farms"
    ADD CONSTRAINT "farms_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."field_operations"
    ADD CONSTRAINT "field_operations_crop_cycle_uuid_fkey" FOREIGN KEY ("crop_cycle_uuid") REFERENCES "public"."crop_cycles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."operation_equipment"
    ADD CONSTRAINT "operation_equipment_equipment_uuid_fkey" FOREIGN KEY ("equipment_uuid") REFERENCES "public"."equipment"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."operation_equipment"
    ADD CONSTRAINT "operation_equipment_field_operation_uuid_fkey" FOREIGN KEY ("field_operation_uuid") REFERENCES "public"."field_operations"("uuid") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."operation_labour"
    ADD CONSTRAINT "operation_labour_field_operation_uuid_fkey" FOREIGN KEY ("field_operation_uuid") REFERENCES "public"."field_operations"("uuid") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."operation_labour"
    ADD CONSTRAINT "operation_labour_labour_uuid_fkey" FOREIGN KEY ("labour_uuid") REFERENCES "public"."labour"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."operation_products"
    ADD CONSTRAINT "operation_products_field_operation_uuid_fkey" FOREIGN KEY ("field_operation_uuid") REFERENCES "public"."field_operations"("uuid") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."operation_products"
    ADD CONSTRAINT "operation_products_product_uuid_fkey" FOREIGN KEY ("product_uuid") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_package_equipment"
    ADD CONSTRAINT "work_package_equipment_daily_work_package_uuid_fkey" FOREIGN KEY ("daily_work_package_uuid") REFERENCES "public"."daily_work_packages"("uuid") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_package_equipment"
    ADD CONSTRAINT "work_package_equipment_equipment_uuid_fkey" FOREIGN KEY ("equipment_uuid") REFERENCES "public"."equipment"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_package_labour"
    ADD CONSTRAINT "work_package_labour_daily_work_package_uuid_fkey" FOREIGN KEY ("daily_work_package_uuid") REFERENCES "public"."daily_work_packages"("uuid") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_package_labour"
    ADD CONSTRAINT "work_package_labour_labour_uuid_fkey" FOREIGN KEY ("labour_uuid") REFERENCES "public"."labour"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_package_products"
    ADD CONSTRAINT "work_package_products_daily_work_package_uuid_fkey" FOREIGN KEY ("daily_work_package_uuid") REFERENCES "public"."daily_work_packages"("uuid") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_package_products"
    ADD CONSTRAINT "work_package_products_product_uuid_fkey" FOREIGN KEY ("product_uuid") REFERENCES "public"."products"("id") ON DELETE CASCADE;





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT ALL ON SCHEMA "public" TO PUBLIC;
GRANT ALL ON SCHEMA "public" TO "anon";
GRANT ALL ON SCHEMA "public" TO "authenticated";
GRANT ALL ON SCHEMA "public" TO "service_role";






































































































































































































RESET ALL;
