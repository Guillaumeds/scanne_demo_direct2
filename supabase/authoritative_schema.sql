
-- =====================================================
-- AUTHORITATIVE DATABASE SCHEMA
-- =====================================================
-- This is the complete, authoritative schema exported from Supabase
-- Generated: 2025-07-17
-- Source: Production Supabase instance
--
-- This schema represents the current state of the database with:
-- - field_operations (main operations table)
-- - daily_work_packages (work package execution)
-- - operation_equipment, operation_products, operation_resources (operation relationships)
-- - work_package_equipment, work_package_products, work_package_resources (work package relationships)
-- - All configuration tables (operation_type_config, operations_method, products, resources, varieties)
-- - Core farm structure (companies, farms, blocs, crop_cycles)
-- - Observations and climatic data
-- =====================================================

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






CREATE OR REPLACE FUNCTION "public"."get_blocs_with_wkt"() RETURNS TABLE("id" "uuid", "name" character varying, "area_hectares" numeric, "coordinates_wkt" "text", "status" character varying, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.id,
        b.name,
        b.area_hectares,
        ST_AsText(b.coordinates) as coordinates_wkt,
        b.status,
        b.created_at,
        b.updated_at
    FROM blocs b
    WHERE b.status = 'active'
    ORDER BY b.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_blocs_with_wkt"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."save_activity_simple"("p_activity_data" "jsonb", "p_products" "jsonb" DEFAULT '[]'::"jsonb", "p_resources" "jsonb" DEFAULT '[]'::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    var_activity_id UUID;
    var_crop_cycle_id UUID;
    product_item JSONB;
    resource_item JSONB;
BEGIN
    -- Extract crop cycle ID
    var_crop_cycle_id := (p_activity_data->>'crop_cycle_id')::UUID;

    -- Insert or update activity (no cost calculations)
    IF (p_activity_data->>'id') IS NOT NULL AND (p_activity_data->>'id') != '' THEN
        -- Update existing activity
        var_activity_id := (p_activity_data->>'id')::UUID;

        UPDATE activities SET
            name = p_activity_data->>'name',
            description = p_activity_data->>'description',
            phase = p_activity_data->>'phase',
            status = COALESCE(p_activity_data->>'status', 'planned'),
            start_date = (p_activity_data->>'start_date')::DATE,
            end_date = (p_activity_data->>'end_date')::DATE,
            duration = (p_activity_data->>'duration')::INTEGER,
            estimated_total_cost = (p_activity_data->>'estimated_total_cost')::DECIMAL(12,2),
            actual_total_cost = (p_activity_data->>'actual_total_cost')::DECIMAL(12,2),
            notes = p_activity_data->>'notes',
            updated_at = NOW()
        WHERE id = var_activity_id;
    ELSE
        -- Insert new activity
        INSERT INTO activities (
            crop_cycle_id,
            name,
            description,
            phase,
            status,
            start_date,
            end_date,
            duration,
            estimated_total_cost,
            actual_total_cost,
            notes
        ) VALUES (
            var_crop_cycle_id,
            p_activity_data->>'name',
            p_activity_data->>'description',
            p_activity_data->>'phase',
            COALESCE(p_activity_data->>'status', 'planned'),
            (p_activity_data->>'start_date')::DATE,
            (p_activity_data->>'end_date')::DATE,
            (p_activity_data->>'duration')::INTEGER,
            (p_activity_data->>'estimated_total_cost')::DECIMAL(12,2),
            (p_activity_data->>'actual_total_cost')::DECIMAL(12,2),
            p_activity_data->>'notes'
        ) RETURNING id INTO var_activity_id;
    END IF;

    -- Clear existing products and resources
    DELETE FROM activity_products WHERE activity_id = var_activity_id;
    DELETE FROM activity_resources WHERE activity_id = var_activity_id;

    -- Insert products
    FOR product_item IN SELECT * FROM jsonb_array_elements(p_products)
    LOOP
        INSERT INTO activity_products (
            activity_id,
            product_id,
            product_name,
            quantity,
            rate,
            unit,
            estimated_cost,
            actual_cost
        ) VALUES (
            var_activity_id,
            (product_item->>'product_id')::UUID,
            product_item->>'product_name',
            (product_item->>'quantity')::DECIMAL(10,2),
            (product_item->>'rate')::DECIMAL(10,2),
            product_item->>'unit',
            (product_item->>'estimated_cost')::DECIMAL(12,2),
            CASE WHEN product_item->>'actual_cost' IS NOT NULL
                 THEN (product_item->>'actual_cost')::DECIMAL(12,2)
                 ELSE NULL END
        );
    END LOOP;

    -- Insert resources
    FOR resource_item IN SELECT * FROM jsonb_array_elements(p_resources)
    LOOP
        INSERT INTO activity_resources (
            activity_id,
            resource_id,
            resource_name,
            hours,
            cost_per_hour,
            estimated_cost,
            actual_cost
        ) VALUES (
            var_activity_id,
            (resource_item->>'resource_id')::UUID,
            resource_item->>'resource_name',
            (resource_item->>'hours')::DECIMAL(10,2),
            (resource_item->>'cost_per_hour')::DECIMAL(10,2),
            (resource_item->>'estimated_cost')::DECIMAL(12,2),
            CASE WHEN resource_item->>'actual_cost' IS NOT NULL
                 THEN (resource_item->>'actual_cost')::DECIMAL(12,2)
                 ELSE NULL END
        );
    END LOOP;

    RETURN var_activity_id;
END;
$$;


ALTER FUNCTION "public"."save_activity_simple"("p_activity_data" "jsonb", "p_products" "jsonb", "p_resources" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."save_bloc_with_smart_name"("p_farm_id" "uuid", "p_coordinates_wkt" "text", "p_area_hectares" numeric) RETURNS TABLE("id" "uuid", "name" character varying, "area_hectares" numeric, "created_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_bloc_id UUID;
    v_bloc_name VARCHAR(255);
    v_next_number INTEGER := 1;
    v_calculated_area DECIMAL(10,2);
BEGIN
    -- Find the lowest available bloc number
    WHILE EXISTS (
        SELECT 1 FROM blocs 
        WHERE name = 'Bloc ' || v_next_number::TEXT
        AND farm_id = p_farm_id
    ) LOOP
        v_next_number := v_next_number + 1;
    END LOOP;
    
    -- Generate the bloc name
    v_bloc_name := 'Bloc ' || v_next_number::TEXT;
    
    -- Calculate area from geometry (in hectares)
    v_calculated_area := ST_Area(ST_GeomFromText(p_coordinates_wkt, 4326)::geography) / 10000;
    
    -- Use provided area if available, otherwise use calculated area
    IF p_area_hectares IS NULL OR p_area_hectares = 0 THEN
        p_area_hectares := v_calculated_area;
    END IF;
    
    -- Insert the new bloc
    INSERT INTO blocs (
        farm_id,
        name,
        area_hectares,
        coordinates,
        status,
        created_at,
        updated_at
    ) VALUES (
        p_farm_id,
        v_bloc_name,
        p_area_hectares,
        ST_GeomFromText(p_coordinates_wkt, 4326),
        'active',
        NOW(),
        NOW()
    ) RETURNING blocs.id INTO v_bloc_id;
    
    -- Return the created bloc information
    RETURN QUERY
    SELECT 
        v_bloc_id as id,
        v_bloc_name as name,
        p_area_hectares as area_hectares,
        NOW() as created_at;
END;
$$;


ALTER FUNCTION "public"."save_bloc_with_smart_name"("p_farm_id" "uuid", "p_coordinates_wkt" "text", "p_area_hectares" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."save_observation_simple"("p_observation_data" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_observation_id UUID;
    v_crop_cycle_id UUID;
BEGIN
    -- Extract crop cycle ID
    v_crop_cycle_id := (p_observation_data->>'crop_cycle_id')::UUID;

    -- Insert or update observation (no calculations)
    IF (p_observation_data->>'id') IS NOT NULL AND (p_observation_data->>'id') != '' THEN
        -- Update existing observation
        v_observation_id := (p_observation_data->>'id')::UUID;

        UPDATE observations SET
            name = p_observation_data->>'name',
            description = p_observation_data->>'description',
            category = p_observation_data->>'category',
            status = p_observation_data->>'status',
            observation_date = (p_observation_data->>'observation_date')::DATE,
            number_of_samples = (p_observation_data->>'number_of_samples')::INTEGER,
            number_of_plants = (p_observation_data->>'number_of_plants')::INTEGER,
            observation_data = COALESCE((p_observation_data->>'observation_data')::JSONB, '{}'::jsonb),
            yield_tons_ha = (p_observation_data->>'yield_tons_ha')::DECIMAL(10,2),
            area_hectares = (p_observation_data->>'area_hectares')::DECIMAL(10,2),
            total_yield_tons = (p_observation_data->>'total_yield_tons')::DECIMAL(10,2),
            sugarcane_revenue = (p_observation_data->>'sugarcane_revenue')::DECIMAL(12,2),
            intercrop_revenue = (p_observation_data->>'intercrop_revenue')::DECIMAL(12,2),
            price_per_tonne = (p_observation_data->>'price_per_tonne')::DECIMAL(10,2),
            revenue_per_hectare = (p_observation_data->>'revenue_per_hectare')::DECIMAL(12,2),
            notes = p_observation_data->>'notes',
            updated_at = NOW()
        WHERE id = v_observation_id;
    ELSE
        -- Insert new observation
        INSERT INTO observations (
            crop_cycle_id,
            name,
            description,
            category,
            status,
            observation_date,
            number_of_samples,
            number_of_plants,
            observation_data,
            yield_tons_ha,
            area_hectares,
            total_yield_tons,
            sugarcane_revenue,
            intercrop_revenue,
            price_per_tonne,
            revenue_per_hectare,
            notes
        ) VALUES (
            v_crop_cycle_id,
            p_observation_data->>'name',
            p_observation_data->>'description',
            p_observation_data->>'category',
            COALESCE(p_observation_data->>'status', 'draft'),
            (p_observation_data->>'observation_date')::DATE,
            (p_observation_data->>'number_of_samples')::INTEGER,
            (p_observation_data->>'number_of_plants')::INTEGER,
            COALESCE((p_observation_data->>'observation_data')::JSONB, '{}'::jsonb),
            (p_observation_data->>'yield_tons_ha')::DECIMAL(10,2),
            (p_observation_data->>'area_hectares')::DECIMAL(10,2),
            (p_observation_data->>'total_yield_tons')::DECIMAL(10,2),
            (p_observation_data->>'sugarcane_revenue')::DECIMAL(12,2),
            (p_observation_data->>'intercrop_revenue')::DECIMAL(12,2),
            (p_observation_data->>'price_per_tonne')::DECIMAL(10,2),
            (p_observation_data->>'revenue_per_hectare')::DECIMAL(12,2),
            p_observation_data->>'notes'
        ) RETURNING id INTO v_observation_id;
    END IF;

    RETURN v_observation_id;
END;
$$;


ALTER FUNCTION "public"."save_observation_simple"("p_observation_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_crop_cycle_totals"("p_cycle_id" "uuid", "p_estimated_total_cost" numeric, "p_actual_total_cost" numeric, "p_total_revenue" numeric, "p_sugarcane_revenue" numeric, "p_intercrop_revenue" numeric, "p_net_profit" numeric, "p_profit_per_hectare" numeric, "p_profit_margin_percent" numeric, "p_sugarcane_actual_yield_tons_ha" numeric) RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE crop_cycles SET
        estimated_total_cost = p_estimated_total_cost,
        actual_total_cost = p_actual_total_cost,
        total_revenue = p_total_revenue,
        sugarcane_revenue = p_sugarcane_revenue,
        intercrop_revenue = p_intercrop_revenue,
        net_profit = p_net_profit,
        profit_per_hectare = p_profit_per_hectare,
        profit_margin_percent = p_profit_margin_percent,
        sugarcane_actual_yield_tons_ha = p_sugarcane_actual_yield_tons_ha,
        updated_at = NOW()
    WHERE id = p_cycle_id;

    RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."update_crop_cycle_totals"("p_cycle_id" "uuid", "p_estimated_total_cost" numeric, "p_actual_total_cost" numeric, "p_total_revenue" numeric, "p_sugarcane_revenue" numeric, "p_intercrop_revenue" numeric, "p_net_profit" numeric, "p_profit_per_hectare" numeric, "p_profit_margin_percent" numeric, "p_sugarcane_actual_yield_tons_ha" numeric) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."blocs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "farm_id" "uuid",
    "name" character varying(255) NOT NULL,
    "area_hectares" numeric(10,2),
    "coordinates" "public"."geometry"(Polygon,4326),
    "status" character varying(50) DEFAULT 'active'::character varying,
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
    "precipitation_mm" "text",
    "wind_speed_m_per_s" double precision,
    "vapor_pressure_hpa" double precision,
    "co2_concentration_ppm" double precision
);


ALTER TABLE "public"."climatic_data" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."companies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."companies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."crop_cycles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "bloc_id" "uuid",
    "type" character varying(50) NOT NULL,
    "cycle_number" integer DEFAULT 1 NOT NULL,
    "status" character varying(50) DEFAULT 'active'::character varying,
    "sugarcane_variety_id" "uuid",
    "intercrop_variety_id" "uuid",
    "parent_cycle_id" "uuid",
    "sugarcane_planting_date" "date",
    "sugarcane_planned_harvest_date" "date",
    "sugarcane_actual_harvest_date" "date",
    "intercrop_planting_date" "date",
    "growth_stage" character varying(50),
    "growth_stage_updated_at" timestamp with time zone,
    "days_since_planting" integer DEFAULT 0,
    "sugarcane_expected_yield_tons_ha" numeric(10,2),
    "sugarcane_actual_yield_tons_ha" numeric(10,2),
    "estimated_total_cost" numeric(12,2) DEFAULT 0,
    "actual_total_cost" numeric(12,2) DEFAULT 0,
    "sugarcane_revenue" numeric(12,2) DEFAULT 0,
    "intercrop_revenue" numeric(12,2) DEFAULT 0,
    "total_revenue" numeric(12,2) DEFAULT 0,
    "net_profit" numeric(12,2) DEFAULT 0,
    "profit_per_hectare" numeric(12,2) DEFAULT 0,
    "profit_margin_percent" numeric(5,2) DEFAULT 0,
    "closure_validated" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."crop_cycles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."crop_cycles"."sugarcane_expected_yield_tons_ha" IS 'Expected/planned sugarcane yield in tons per hectare (set during crop cycle creation)';



COMMENT ON COLUMN "public"."crop_cycles"."sugarcane_actual_yield_tons_ha" IS 'Actual sugarcane yield in tons per hectare (calculated from observations)';



CREATE TABLE IF NOT EXISTS "public"."daily_work_packages" (
    "uuid" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "field_operation_uuid" "uuid",
    "package_name" character varying,
    "work_date" "date" NOT NULL,
    "shift" character varying DEFAULT 'day'::character varying,
    "planned_area_hectares" numeric(10,2),
    "actual_area_hectares" numeric(10,2),
    "planned_quantity" numeric(10,2),
    "actual_quantity" numeric(10,2),
    "status" character varying DEFAULT 'not-started'::character varying,
    "start_time" time without time zone,
    "end_time" time without time zone,
    "duration_hours" numeric(4,1),
    "weather_conditions" character varying,
    "temperature_celsius" numeric(4,1),
    "humidity_percent" integer,
    "wind_speed_kmh" numeric(5,1),
    "team_leader" character varying,
    "number_of_workers" integer DEFAULT 0,
    "worker_names" "text"[],
    "supervisor" character varying,
    "quality_rating" integer,
    "effectiveness_rating" integer,
    "completion_percentage" integer DEFAULT 0,
    "labor_cost" numeric(10,2),
    "equipment_cost" numeric(10,2),
    "fuel_cost" numeric(10,2),
    "material_cost" numeric(10,2),
    "other_costs" numeric(10,2),
    "total_cost" numeric(12,2),
    "daily_yield_tons" numeric(10,2),
    "daily_area_completed" numeric(8,2),
    "corrective_actions" "text",
    "safety_incidents" "text",
    "observations" "text",
    "issues_encountered" "text",
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "daily_work_packages_completion_percentage_check" CHECK ((("completion_percentage" >= 0) AND ("completion_percentage" <= 100))),
    CONSTRAINT "daily_work_packages_effectiveness_rating_check" CHECK ((("effectiveness_rating" >= 1) AND ("effectiveness_rating" <= 5))),
    CONSTRAINT "daily_work_packages_humidity_percent_check" CHECK ((("humidity_percent" >= 0) AND ("humidity_percent" <= 100))),
    CONSTRAINT "daily_work_packages_quality_rating_check" CHECK ((("quality_rating" >= 1) AND ("quality_rating" <= 5))),
    CONSTRAINT "daily_work_packages_shift_check" CHECK ((("shift")::"text" = ANY ((ARRAY['day'::character varying, 'night'::character varying, 'morning'::character varying, 'afternoon'::character varying])::"text"[]))),
    CONSTRAINT "daily_work_packages_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['not-started'::character varying, 'in-progress'::character varying, 'completed'::character varying, 'cancelled'::character varying, 'postponed'::character varying])::"text"[])))
);


ALTER TABLE "public"."daily_work_packages" OWNER TO "postgres";


COMMENT ON TABLE "public"."daily_work_packages" IS 'Daily work packages for detailed operation tracking';



CREATE TABLE IF NOT EXISTS "public"."equipment" (
    "uuid" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "equipment_id" character varying NOT NULL,
    "name" character varying NOT NULL,
    "category" character varying NOT NULL,
    "model" character varying,
    "capacity" character varying,
    "fuel_consumption_per_hour" numeric(6,2),
    "operating_cost_per_hour" numeric(10,2) NOT NULL,
    "status" character varying DEFAULT 'available'::character varying,
    "description" "text",
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "equipment_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['available'::character varying, 'in-use'::character varying, 'maintenance'::character varying, 'retired'::character varying])::"text"[])))
);


ALTER TABLE "public"."equipment" OWNER TO "postgres";


COMMENT ON TABLE "public"."equipment" IS 'Equipment used in operations (tractors, sprayers, etc)';



CREATE TABLE IF NOT EXISTS "public"."farms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid",
    "name" character varying(255) NOT NULL,
    "location" character varying(255),
    "total_area_hectares" numeric(10,2),
    "border_coordinates" "public"."geometry"(Polygon,4326),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."farms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."field_operations" (
    "uuid" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "crop_cycle_uuid" "uuid",
    "operation_name" character varying NOT NULL,
    "operation_type" character varying NOT NULL,
    "method" character varying,
    "priority" character varying DEFAULT 'medium'::character varying,
    "planned_start_date" "date" NOT NULL,
    "planned_end_date" "date" NOT NULL,
    "actual_start_date" "date",
    "actual_end_date" "date",
    "planned_area_hectares" numeric(10,2),
    "actual_area_hectares" numeric(10,2),
    "planned_quantity" numeric(10,2),
    "actual_quantity" numeric(10,2),
    "status" character varying DEFAULT 'planned'::character varying,
    "completion_percentage" integer DEFAULT 0,
    "estimated_total_cost" numeric(12,2) DEFAULT 0,
    "actual_total_cost" numeric(12,2) DEFAULT 0,
    "estimated_revenue" numeric(12,2) DEFAULT 0,
    "actual_revenue" numeric(12,2) DEFAULT 0,
    "total_yield_tons" numeric(10,2),
    "yield_per_hectare" numeric(8,2),
    "brix_percentage" numeric(5,2),
    "sugar_content_percentage" numeric(5,2),
    "total_sugarcane_revenue" numeric(12,2),
    "revenue_per_hectare" numeric(12,2),
    "price_per_tonne" numeric(10,2),
    "weather_dependency" boolean DEFAULT false,
    "optimal_weather_conditions" "text",
    "quality_rating" integer,
    "effectiveness_rating" integer,
    "description" "text",
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "field_operations_completion_percentage_check" CHECK ((("completion_percentage" >= 0) AND ("completion_percentage" <= 100))),
    CONSTRAINT "field_operations_effectiveness_rating_check" CHECK ((("effectiveness_rating" >= 1) AND ("effectiveness_rating" <= 5))),
    CONSTRAINT "field_operations_method_check" CHECK ((("method")::"text" = ANY ((ARRAY['manual'::character varying, 'mechanical'::character varying, 'chemical'::character varying, 'biological'::character varying, 'aerial'::character varying, 'precision'::character varying])::"text"[]))),
    CONSTRAINT "field_operations_operation_type_check" CHECK ((("operation_type")::"text" = ANY ((ARRAY['land_preparation'::character varying, 'planting'::character varying, 'fertilization'::character varying, 'weed_control'::character varying, 'pest_control'::character varying, 'irrigation'::character varying, 'cultivation'::character varying, 'harvesting'::character varying, 'maintenance'::character varying, 'other'::character varying])::"text"[]))),
    CONSTRAINT "field_operations_priority_check" CHECK ((("priority")::"text" = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'urgent'::character varying])::"text"[]))),
    CONSTRAINT "field_operations_quality_rating_check" CHECK ((("quality_rating" >= 1) AND ("quality_rating" <= 5))),
    CONSTRAINT "field_operations_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['planned'::character varying, 'in-progress'::character varying, 'completed'::character varying, 'cancelled'::character varying, 'on-hold'::character varying])::"text"[])))
);


ALTER TABLE "public"."field_operations" OWNER TO "postgres";


COMMENT ON TABLE "public"."field_operations" IS 'Main operations table for field activities';



CREATE TABLE IF NOT EXISTS "public"."intercrop_varieties" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "variety_id" character varying(50) NOT NULL,
    "name" character varying(100) NOT NULL,
    "scientific_name" character varying(150),
    "category" character varying(100),
    "benefits" "text"[],
    "planting_time" character varying(100),
    "harvest_time" character varying(100),
    "description" "text",
    "image_url" "text",
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."intercrop_varieties" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."observations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "crop_cycle_id" "uuid",
    "name" character varying(255) NOT NULL,
    "description" "text",
    "category" character varying(100),
    "status" character varying(50) DEFAULT 'draft'::character varying,
    "observation_date" "date",
    "number_of_samples" integer,
    "number_of_plants" integer,
    "observation_data" "jsonb" DEFAULT '{}'::"jsonb",
    "yield_tons_ha" numeric(10,2),
    "area_hectares" numeric(10,2),
    "total_yield_tons" numeric(10,2),
    "sugarcane_revenue" numeric(12,2),
    "intercrop_revenue" numeric(12,2),
    "price_per_tonne" numeric(10,2),
    "revenue_per_hectare" numeric(12,2),
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."observations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."operation_equipment" (
    "uuid" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "field_operation_uuid" "uuid",
    "equipment_uuid" "uuid",
    "planned_hours" numeric(6,2) NOT NULL,
    "actual_hours" numeric(6,2),
    "hourly_rate" numeric(10,2) NOT NULL,
    "estimated_total_cost" numeric(12,2) NOT NULL,
    "actual_total_cost" numeric(12,2),
    "operator_name" character varying,
    "status" character varying DEFAULT 'planned'::character varying,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "operation_equipment_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['planned'::character varying, 'in-use'::character varying, 'completed'::character varying, 'maintenance'::character varying, 'cancelled'::character varying])::"text"[])))
);


ALTER TABLE "public"."operation_equipment" OWNER TO "postgres";


COMMENT ON TABLE "public"."operation_equipment" IS 'Equipment used in field operations';



CREATE TABLE IF NOT EXISTS "public"."operation_products" (
    "uuid" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "field_operation_uuid" "uuid",
    "product_uuid" "uuid",
    "planned_quantity" numeric(10,2) NOT NULL,
    "actual_quantity" numeric(10,2),
    "unit_cost" numeric(10,2) NOT NULL,
    "estimated_total_cost" numeric(12,2) NOT NULL,
    "actual_total_cost" numeric(12,2),
    "status" character varying DEFAULT 'planned'::character varying,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "operation_products_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['planned'::character varying, 'applied'::character varying, 'cancelled'::character varying])::"text"[])))
);


ALTER TABLE "public"."operation_products" OWNER TO "postgres";


COMMENT ON TABLE "public"."operation_products" IS 'Products used in field operations';



CREATE TABLE IF NOT EXISTS "public"."operation_resources" (
    "uuid" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "field_operation_uuid" "uuid",
    "resource_uuid" "uuid",
    "planned_quantity" numeric(10,2) NOT NULL,
    "actual_quantity" numeric(10,2),
    "unit_cost" numeric(10,2) NOT NULL,
    "estimated_total_cost" numeric(12,2) NOT NULL,
    "actual_total_cost" numeric(12,2),
    "status" character varying DEFAULT 'planned'::character varying,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "operation_resources_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['planned'::character varying, 'allocated'::character varying, 'completed'::character varying, 'cancelled'::character varying])::"text"[])))
);


ALTER TABLE "public"."operation_resources" OWNER TO "postgres";


COMMENT ON TABLE "public"."operation_resources" IS 'Resources used in field operations';



CREATE TABLE IF NOT EXISTS "public"."operation_type_config" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ordr" integer NOT NULL,
    "operation_type" character varying(100) NOT NULL,
    "description" "text",
    "icon" character varying(10),
    "color_class" character varying(50),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."operation_type_config" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."operations_method" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ordr" integer NOT NULL,
    "method" character varying(100) NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."operations_method" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" character varying(50) NOT NULL,
    "name" character varying(100) NOT NULL,
    "category" character varying(100),
    "subcategory" character varying(100),
    "unit" character varying(20),
    "cost_per_unit" numeric(10,2),
    "supplier" character varying(100),
    "description" "text",
    "image_url" "text",
    "information_leaflet_url" "text",
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "resource_id" character varying(50) NOT NULL,
    "name" character varying(100) NOT NULL,
    "category" character varying(100),
    "subcategory" character varying(100),
    "unit" character varying(20),
    "cost_per_unit" numeric(10,2),
    "description" "text",
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."resources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sugarcane_varieties" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "variety_id" character varying(50) NOT NULL,
    "name" character varying(100) NOT NULL,
    "category" character varying(100),
    "harvest_start_month" character varying(20),
    "harvest_end_month" character varying(20),
    "seasons" "text"[],
    "soil_types" "text"[],
    "sugar_content_percent" numeric(5,2),
    "characteristics" "jsonb" DEFAULT '{}'::"jsonb",
    "description" "text",
    "image_url" "text",
    "information_leaflet_url" "text",
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sugarcane_varieties" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."work_package_equipment" (
    "uuid" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "daily_work_package_uuid" "uuid",
    "equipment_uuid" "uuid",
    "planned_hours" numeric(6,2) NOT NULL,
    "actual_hours" numeric(6,2),
    "hourly_rate" numeric(10,2) NOT NULL,
    "estimated_total_cost" numeric(12,2) NOT NULL,
    "actual_total_cost" numeric(12,2),
    "operator_name" character varying,
    "maintenance_required" boolean DEFAULT false,
    "pre_operation_check" boolean DEFAULT false,
    "post_operation_check" boolean DEFAULT false,
    "status" character varying DEFAULT 'planned'::character varying,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "work_package_equipment_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['planned'::character varying, 'in-use'::character varying, 'completed'::character varying, 'maintenance'::character varying, 'cancelled'::character varying])::"text"[])))
);


ALTER TABLE "public"."work_package_equipment" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."work_package_products" (
    "uuid" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "daily_work_package_uuid" "uuid",
    "product_uuid" "uuid",
    "planned_quantity" numeric(10,2) NOT NULL,
    "actual_quantity" numeric(10,2),
    "unit_cost" numeric(10,2) NOT NULL,
    "estimated_total_cost" numeric(12,2) NOT NULL,
    "actual_total_cost" numeric(12,2),
    "quality_check_passed" boolean DEFAULT false,
    "status" character varying DEFAULT 'planned'::character varying,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "work_package_products_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['planned'::character varying, 'applied'::character varying, 'completed'::character varying, 'prepared'::character varying])::"text"[])))
);


ALTER TABLE "public"."work_package_products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."work_package_resources" (
    "uuid" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "daily_work_package_uuid" "uuid",
    "resource_uuid" "uuid",
    "planned_quantity" numeric(10,2) NOT NULL,
    "actual_quantity" numeric(10,2),
    "unit_cost" numeric(10,2) NOT NULL,
    "estimated_total_cost" numeric(12,2) NOT NULL,
    "actual_total_cost" numeric(12,2),
    "status" character varying DEFAULT 'planned'::character varying,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "work_package_resources_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['planned'::character varying, 'allocated'::character varying, 'completed'::character varying, 'cancelled'::character varying])::"text"[])))
);


ALTER TABLE "public"."work_package_resources" OWNER TO "postgres";


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
    ADD CONSTRAINT "equipment_pkey" PRIMARY KEY ("uuid");



ALTER TABLE ONLY "public"."farms"
    ADD CONSTRAINT "farms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."field_operations"
    ADD CONSTRAINT "field_operations_pkey" PRIMARY KEY ("uuid");



ALTER TABLE ONLY "public"."intercrop_varieties"
    ADD CONSTRAINT "intercrop_varieties_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."intercrop_varieties"
    ADD CONSTRAINT "intercrop_varieties_variety_id_key" UNIQUE ("variety_id");



ALTER TABLE ONLY "public"."observations"
    ADD CONSTRAINT "observations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."operation_equipment"
    ADD CONSTRAINT "operation_equipment_pkey" PRIMARY KEY ("uuid");



ALTER TABLE ONLY "public"."operation_products"
    ADD CONSTRAINT "operation_products_pkey" PRIMARY KEY ("uuid");



ALTER TABLE ONLY "public"."operation_resources"
    ADD CONSTRAINT "operation_resources_pkey" PRIMARY KEY ("uuid");



ALTER TABLE ONLY "public"."operation_type_config"
    ADD CONSTRAINT "operation_type_config_operation_type_key" UNIQUE ("operation_type");



ALTER TABLE ONLY "public"."operation_type_config"
    ADD CONSTRAINT "operation_type_config_ordr_key" UNIQUE ("ordr");



ALTER TABLE ONLY "public"."operation_type_config"
    ADD CONSTRAINT "operation_type_config_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."operations_method"
    ADD CONSTRAINT "operations_method_method_key" UNIQUE ("method");



ALTER TABLE ONLY "public"."operations_method"
    ADD CONSTRAINT "operations_method_ordr_key" UNIQUE ("ordr");



ALTER TABLE ONLY "public"."operations_method"
    ADD CONSTRAINT "operations_method_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_product_id_key" UNIQUE ("product_id");



ALTER TABLE ONLY "public"."resources"
    ADD CONSTRAINT "resources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resources"
    ADD CONSTRAINT "resources_resource_id_key" UNIQUE ("resource_id");



ALTER TABLE ONLY "public"."sugarcane_varieties"
    ADD CONSTRAINT "sugarcane_varieties_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sugarcane_varieties"
    ADD CONSTRAINT "sugarcane_varieties_variety_id_key" UNIQUE ("variety_id");



ALTER TABLE ONLY "public"."work_package_equipment"
    ADD CONSTRAINT "work_package_equipment_pkey" PRIMARY KEY ("uuid");



ALTER TABLE ONLY "public"."work_package_products"
    ADD CONSTRAINT "work_package_products_pkey" PRIMARY KEY ("uuid");



ALTER TABLE ONLY "public"."work_package_resources"
    ADD CONSTRAINT "work_package_resources_pkey" PRIMARY KEY ("uuid");



CREATE INDEX "idx_daily_work_packages_date" ON "public"."daily_work_packages" USING "btree" ("work_date");



CREATE INDEX "idx_daily_work_packages_operation" ON "public"."daily_work_packages" USING "btree" ("field_operation_uuid");



CREATE INDEX "idx_daily_work_packages_status" ON "public"."daily_work_packages" USING "btree" ("status");



CREATE INDEX "idx_field_operations_crop_cycle" ON "public"."field_operations" USING "btree" ("crop_cycle_uuid");



CREATE INDEX "idx_field_operations_dates" ON "public"."field_operations" USING "btree" ("planned_start_date", "planned_end_date");



CREATE INDEX "idx_field_operations_status" ON "public"."field_operations" USING "btree" ("status");



CREATE INDEX "idx_operation_type_config_ordr" ON "public"."operation_type_config" USING "btree" ("ordr");



CREATE INDEX "idx_operations_method_ordr" ON "public"."operations_method" USING "btree" ("ordr");



ALTER TABLE ONLY "public"."blocs"
    ADD CONSTRAINT "blocs_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."crop_cycles"
    ADD CONSTRAINT "crop_cycles_bloc_id_fkey" FOREIGN KEY ("bloc_id") REFERENCES "public"."blocs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."crop_cycles"
    ADD CONSTRAINT "crop_cycles_intercrop_variety_id_fkey" FOREIGN KEY ("intercrop_variety_id") REFERENCES "public"."intercrop_varieties"("id");



ALTER TABLE ONLY "public"."crop_cycles"
    ADD CONSTRAINT "crop_cycles_parent_cycle_id_fkey" FOREIGN KEY ("parent_cycle_id") REFERENCES "public"."crop_cycles"("id");



ALTER TABLE ONLY "public"."crop_cycles"
    ADD CONSTRAINT "crop_cycles_sugarcane_variety_id_fkey" FOREIGN KEY ("sugarcane_variety_id") REFERENCES "public"."sugarcane_varieties"("id");



ALTER TABLE ONLY "public"."daily_work_packages"
    ADD CONSTRAINT "daily_work_packages_field_operation_uuid_fkey" FOREIGN KEY ("field_operation_uuid") REFERENCES "public"."field_operations"("uuid") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."farms"
    ADD CONSTRAINT "farms_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."field_operations"
    ADD CONSTRAINT "field_operations_crop_cycle_uuid_fkey" FOREIGN KEY ("crop_cycle_uuid") REFERENCES "public"."crop_cycles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."observations"
    ADD CONSTRAINT "observations_crop_cycle_id_fkey" FOREIGN KEY ("crop_cycle_id") REFERENCES "public"."crop_cycles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."operation_equipment"
    ADD CONSTRAINT "operation_equipment_equipment_uuid_fkey" FOREIGN KEY ("equipment_uuid") REFERENCES "public"."equipment"("uuid") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."operation_equipment"
    ADD CONSTRAINT "operation_equipment_field_operation_uuid_fkey" FOREIGN KEY ("field_operation_uuid") REFERENCES "public"."field_operations"("uuid") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."operation_products"
    ADD CONSTRAINT "operation_products_field_operation_uuid_fkey" FOREIGN KEY ("field_operation_uuid") REFERENCES "public"."field_operations"("uuid") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."operation_products"
    ADD CONSTRAINT "operation_products_product_uuid_fkey" FOREIGN KEY ("product_uuid") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."operation_resources"
    ADD CONSTRAINT "operation_resources_field_operation_uuid_fkey" FOREIGN KEY ("field_operation_uuid") REFERENCES "public"."field_operations"("uuid") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."operation_resources"
    ADD CONSTRAINT "operation_resources_resource_uuid_fkey" FOREIGN KEY ("resource_uuid") REFERENCES "public"."resources"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_package_equipment"
    ADD CONSTRAINT "work_package_equipment_daily_work_package_uuid_fkey" FOREIGN KEY ("daily_work_package_uuid") REFERENCES "public"."daily_work_packages"("uuid") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_package_equipment"
    ADD CONSTRAINT "work_package_equipment_equipment_uuid_fkey" FOREIGN KEY ("equipment_uuid") REFERENCES "public"."equipment"("uuid") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_package_products"
    ADD CONSTRAINT "work_package_products_daily_work_package_uuid_fkey" FOREIGN KEY ("daily_work_package_uuid") REFERENCES "public"."daily_work_packages"("uuid") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_package_products"
    ADD CONSTRAINT "work_package_products_product_uuid_fkey" FOREIGN KEY ("product_uuid") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_package_resources"
    ADD CONSTRAINT "work_package_resources_daily_work_package_uuid_fkey" FOREIGN KEY ("daily_work_package_uuid") REFERENCES "public"."daily_work_packages"("uuid") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_package_resources"
    ADD CONSTRAINT "work_package_resources_resource_uuid_fkey" FOREIGN KEY ("resource_uuid") REFERENCES "public"."resources"("id") ON DELETE CASCADE;



CREATE POLICY "Allow anonymous read access to operation_type_config" ON "public"."operation_type_config" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Allow anonymous read access to operations_method" ON "public"."operations_method" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Allow authenticated read access to operation_type_config" ON "public"."operation_type_config" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated read access to operations_method" ON "public"."operations_method" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read access to operation_type_config" ON "public"."operation_type_config" FOR SELECT USING (true);



CREATE POLICY "Allow read access to operations_method" ON "public"."operations_method" FOR SELECT USING (true);



CREATE POLICY "Users can delete equipment" ON "public"."equipment" FOR DELETE USING (true);



CREATE POLICY "Users can delete field operations" ON "public"."field_operations" FOR DELETE USING (true);



CREATE POLICY "Users can delete operation equipment" ON "public"."operation_equipment" FOR DELETE USING (true);



CREATE POLICY "Users can delete operation products" ON "public"."operation_products" FOR DELETE USING (true);



CREATE POLICY "Users can delete operation resources" ON "public"."operation_resources" FOR DELETE USING (true);



CREATE POLICY "Users can delete work package equipment" ON "public"."work_package_equipment" FOR DELETE USING (true);



CREATE POLICY "Users can delete work package products" ON "public"."work_package_products" FOR DELETE USING (true);



CREATE POLICY "Users can delete work package resources" ON "public"."work_package_resources" FOR DELETE USING (true);



CREATE POLICY "Users can delete work packages" ON "public"."daily_work_packages" FOR DELETE USING (true);



CREATE POLICY "Users can insert equipment" ON "public"."equipment" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can insert field operations" ON "public"."field_operations" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can insert operation equipment" ON "public"."operation_equipment" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can insert operation products" ON "public"."operation_products" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can insert operation resources" ON "public"."operation_resources" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can insert work package equipment" ON "public"."work_package_equipment" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can insert work package products" ON "public"."work_package_products" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can insert work package resources" ON "public"."work_package_resources" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can insert work packages" ON "public"."daily_work_packages" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can update equipment" ON "public"."equipment" FOR UPDATE USING (true);



CREATE POLICY "Users can update field operations" ON "public"."field_operations" FOR UPDATE USING (true);



CREATE POLICY "Users can update operation equipment" ON "public"."operation_equipment" FOR UPDATE USING (true);



CREATE POLICY "Users can update operation products" ON "public"."operation_products" FOR UPDATE USING (true);



CREATE POLICY "Users can update operation resources" ON "public"."operation_resources" FOR UPDATE USING (true);



CREATE POLICY "Users can update work package equipment" ON "public"."work_package_equipment" FOR UPDATE USING (true);



CREATE POLICY "Users can update work package products" ON "public"."work_package_products" FOR UPDATE USING (true);



CREATE POLICY "Users can update work package resources" ON "public"."work_package_resources" FOR UPDATE USING (true);



CREATE POLICY "Users can update work packages" ON "public"."daily_work_packages" FOR UPDATE USING (true);



CREATE POLICY "Users can view all equipment" ON "public"."equipment" FOR SELECT USING (true);



CREATE POLICY "Users can view all field operations" ON "public"."field_operations" FOR SELECT USING (true);



CREATE POLICY "Users can view all operation equipment" ON "public"."operation_equipment" FOR SELECT USING (true);



CREATE POLICY "Users can view all operation products" ON "public"."operation_products" FOR SELECT USING (true);



CREATE POLICY "Users can view all operation resources" ON "public"."operation_resources" FOR SELECT USING (true);



CREATE POLICY "Users can view all work package equipment" ON "public"."work_package_equipment" FOR SELECT USING (true);



CREATE POLICY "Users can view all work package products" ON "public"."work_package_products" FOR SELECT USING (true);



CREATE POLICY "Users can view all work package resources" ON "public"."work_package_resources" FOR SELECT USING (true);



CREATE POLICY "Users can view all work packages" ON "public"."daily_work_packages" FOR SELECT USING (true);





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT ALL ON SCHEMA "public" TO PUBLIC;
GRANT ALL ON SCHEMA "public" TO "anon";
GRANT ALL ON SCHEMA "public" TO "authenticated";
GRANT ALL ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."get_blocs_with_wkt"() TO "anon";


















GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."blocs" TO "anon";



GRANT SELECT ON TABLE "public"."companies" TO "anon";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."crop_cycles" TO "anon";



GRANT SELECT ON TABLE "public"."farms" TO "anon";



GRANT SELECT ON TABLE "public"."intercrop_varieties" TO "anon";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."observations" TO "anon";



GRANT SELECT ON TABLE "public"."products" TO "anon";



GRANT SELECT ON TABLE "public"."resources" TO "anon";



GRANT SELECT ON TABLE "public"."sugarcane_varieties" TO "anon";

































RESET ALL;
