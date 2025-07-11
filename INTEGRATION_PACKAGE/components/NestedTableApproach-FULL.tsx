import React, { useState, useMemo } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import {
  Box,
  Typography,
  Grid,
  LinearProgress,
  Tooltip,
  IconButton,
  Button,
  Card,
  MenuItem,
} from '@mui/material';
import {
  Agriculture,
  Schedule,
  AttachMoney,
  Add,
  Delete,
} from '@mui/icons-material';

// Updated data structure for your agricultural schema
interface BlocNode {
  id: string;
  name: string;
  area_hectares: number;
  cycle_number: number[];
  variety_name: string;
  planned_harvest_date: string;
  expected_yield_tons_ha: number;
  growth_stage: string;
  progress: number;
  total_est_product_cost: number;
  total_est_resource_cost: number;
  total_act_product_cost: number;
  total_act_resource_cost: number;
  products?: ProductNode[];
}

interface ProductNode {
  id: string;
  product_name: string;
  days_after_planting: number;
  planned_start_date: string;
  planned_end_date: string;
  planned_rate: number;
  method: 'mechanical' | 'manual' | 'mixed';
  progress: number;
  est_product_cost: number;
  est_resource_cost: number;
  act_product_cost: number;
  act_resource_cost: number;
  work_packages?: WorkPackageNode[];
}

interface WorkPackageNode {
  id: string;
  days_after_planting: number;
  date: string;
  area: number;
  rate: number;
  quantity: number;
}

// Sample data matching your agricultural schema
const sampleBlocData: BlocNode[] = [
  {
    id: 'bloc_1',
    name: 'North Field Block A',
    area_hectares: 25.5,
    cycle_number: [1, 2],
    variety_name: 'NCo 376',
    planned_harvest_date: '2024-08-15',
    expected_yield_tons_ha: 85.2,
    growth_stage: 'Tillering',
    progress: 65,
    total_est_product_cost: 125000,
    total_est_resource_cost: 85000,
    total_act_product_cost: 98000,
    total_act_resource_cost: 72000,
    products: [
      {
        id: 'prod_1',
        product_name: 'Land Preparation',
        days_after_planting: -30,
        planned_start_date: '2024-01-15',
        planned_end_date: '2024-01-25',
        planned_rate: 2.5,
        method: 'mechanical',
        progress: 100,
        est_product_cost: 15000,
        est_resource_cost: 8000,
        act_product_cost: 14500,
        act_resource_cost: 7800,
        work_packages: [
          {
            id: 'wp_1',
            days_after_planting: -30,
            date: '2024-01-15',
            area: 5.0,
            rate: 2.5,
            quantity: 12.5
          },
          {
            id: 'wp_2',
            days_after_planting: -29,
            date: '2024-01-16',
            area: 6.2,
            rate: 2.5,
            quantity: 15.5
          }
        ]
      },
      {
        id: 'prod_2',
        product_name: 'Fertilizer Application',
        days_after_planting: 45,
        planned_start_date: '2024-03-15',
        planned_end_date: '2024-03-20',
        planned_rate: 150,
        method: 'mixed',
        progress: 75,
        est_product_cost: 25000,
        est_resource_cost: 12000,
        act_product_cost: 23500,
        act_resource_cost: 11200,
        work_packages: [
          {
            id: 'wp_3',
            days_after_planting: 45,
            date: '2024-03-15',
            area: 8.5,
            rate: 150,
            quantity: 1275
          }
        ]
      }
    ]
  },
  {
    id: 'bloc_2',
    name: 'South Field Block B',
    area_hectares: 18.3,
    cycle_number: [1],
    variety_name: 'CP 72-2086',
    planned_harvest_date: '2024-09-10',
    expected_yield_tons_ha: 78.5,
    growth_stage: 'Grand Growth',
    progress: 45,
    total_est_product_cost: 95000,
    total_est_resource_cost: 65000,
    total_act_product_cost: 42000,
    total_act_resource_cost: 28000,
    products: [
      {
        id: 'prod_3',
        product_name: 'Planting',
        days_after_planting: 0,
        planned_start_date: '2024-02-01',
        planned_end_date: '2024-02-10',
        planned_rate: 3.5,
        method: 'manual',
        progress: 100,
        est_product_cost: 18000,
        est_resource_cost: 15000,
        act_product_cost: 17500,
        act_resource_cost: 14200,
        work_packages: []
      }
    ]
  }
];

const NestedTableApproach: React.FC = () => {
  const [data, setData] = useState<BlocNode[]>(sampleBlocData);

  // Function to add a new bloc
  const addBloc = () => {
    const newBloc: BlocNode = {
      id: `bloc_${Date.now()}`,
      name: `New Bloc ${data.length + 1}`,
      area_hectares: 0,
      cycle_number: [1],
      variety_name: 'New Variety',
      planned_harvest_date: new Date().toISOString().split('T')[0],
      expected_yield_tons_ha: 0,
      growth_stage: 'Planning',
      progress: 0,
      total_est_product_cost: 0,
      total_est_resource_cost: 0,
      total_act_product_cost: 0,
      total_act_resource_cost: 0,
      products: []
    };
    setData([...data, newBloc]);
  };

  // Product options for multiselect
  const productOptions = useMemo(() => [
    'Prepare Land',
    'Prepare Sets',
    'Place Sets',
    'Weed Killer',
    'NPK 14-20-20',
    'NPK 20-46-60',
    'Bagasse Ash',
    'Poltry Manure'
  ], []);

  // Method options for dropdown
  const methodOptions = useMemo(() => [
    'Mechanical',
    'Manual',
    'Mix'
  ], []);

  // Function to add a new product to a bloc
  const addProduct = (blocId: string) => {
    const newProduct: ProductNode = {
      id: `prod_${Date.now()}`,
      product_name: 'Prepare Land',
      days_after_planting: 0,
      planned_start_date: new Date().toISOString().split('T')[0],
      planned_end_date: new Date().toISOString().split('T')[0],
      planned_rate: 0,
      method: 'mechanical',
      progress: 0,
      est_product_cost: 0,
      est_resource_cost: 0,
      act_product_cost: 0,
      act_resource_cost: 0,
      work_packages: []
    };

    setData(data.map(bloc =>
      bloc.id === blocId
        ? { ...bloc, products: [newProduct, ...(bloc.products || [])] }
        : bloc
    ));
  };

  // Function to add a new work package to a product
  const addWorkPackage = (blocId: string, productId: string) => {
    const newWorkPackage: WorkPackageNode = {
      id: `wp_${Date.now()}`,
      days_after_planting: 0,
      date: new Date().toISOString().split('T')[0],
      area: 0,
      rate: 0,
      quantity: 0
    };

    setData(data.map(bloc =>
      bloc.id === blocId
        ? {
            ...bloc,
            products: (bloc.products || []).map(product =>
              product.id === productId
                ? { ...product, work_packages: [newWorkPackage, ...(product.work_packages || [])] }
                : product
            )
          }
        : bloc
    ));
  };

  // Function to delete a bloc
  const deleteBloc = (blocId: string) => {
    setData(data.filter(bloc => bloc.id !== blocId));
  };

  // Function to delete a product
  const deleteProduct = (blocId: string, productId: string) => {
    setData(data.map(bloc =>
      bloc.id === blocId
        ? { ...bloc, products: (bloc.products || []).filter(product => product.id !== productId) }
        : bloc
    ));
  };

  // Function to delete a work package
  const deleteWorkPackage = (blocId: string, productId: string, workPackageId: string) => {
    setData(data.map(bloc =>
      bloc.id === blocId
        ? {
            ...bloc,
            products: (bloc.products || []).map(product =>
              product.id === productId
                ? { ...product, work_packages: (product.work_packages || []).filter(wp => wp.id !== workPackageId) }
                : product
            )
          }
        : bloc
    ));
  };

  // Main bloc columns (Level 1 - Root)
  const blocColumns = useMemo<MRT_ColumnDef<BlocNode>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Bloc Name',
      size: 150,
      enableEditing: true,
      Cell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Agriculture color="primary" />
          <Typography variant="body2" fontWeight="bold">
            {row.original.name}
          </Typography>
        </Box>
      ),
    },
    {
      accessorKey: 'area_hectares',
      header: 'Area (hectares)',
      size: 120,
      enableEditing: true,
      Cell: ({ cell }) => (
        <Typography variant="body2">
          {(cell.getValue<number>() || 0).toFixed(1)} ha
        </Typography>
      ),
    },
    {
      accessorKey: 'cycle_number',
      header: 'Cycles',
      size: 120,
      enableEditing: true,
      Cell: ({ cell }) => (
        <Typography variant="body2">
          {(cell.getValue<number[]>() || []).join(', ')}
        </Typography>
      ),
    },
    {
      accessorKey: 'variety_name',
      header: 'Variety',
      size: 140,
      enableEditing: true,
      Cell: ({ cell }) => (
        <Typography variant="body2">
          {cell.getValue<string>()}
        </Typography>
      ),
    },
    {
      accessorKey: 'planned_harvest_date',
      header: 'Planned Harvest',
      size: 140,
      enableEditing: true,
      Cell: ({ cell }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Schedule fontSize="small" color="warning" />
          <Typography variant="body2">
            {new Date(cell.getValue<string>()).toLocaleDateString()}
          </Typography>
        </Box>
      ),
      muiEditTextFieldProps: {
        type: 'date',
      },
    },
    {
      accessorKey: 'expected_yield_tons_ha',
      header: 'Expected Yield (t/ha)',
      size: 150,
      enableEditing: true,
      Cell: ({ cell }) => (
        <Typography variant="body2">
          {(cell.getValue<number>() || 0).toFixed(1)}
        </Typography>
      ),
    },
    {
      accessorKey: 'growth_stage',
      header: 'Growth Stage',
      size: 130,
      enableEditing: true,
      Cell: ({ cell }) => (
        <Typography variant="body2">
          {cell.getValue<string>()}
        </Typography>
      ),
    },
  ], []);



  // Product table columns (Level 2 - Branch)
  const productColumns = useMemo<MRT_ColumnDef<ProductNode>[]>(() => [
    {
      accessorKey: 'product_name',
      header: 'Product Name',
      size: 180,
      enableEditing: true,
      Cell: ({ cell }) => (
        <Typography variant="body2" fontWeight="medium">
          {cell.getValue<string>()}
        </Typography>
      ),
      muiEditTextFieldProps: {
        select: true,
        children: productOptions.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        )),
      },
    },
    {
      accessorKey: 'days_after_planting',
      header: 'Days After Planting',
      size: 140,
      enableEditing: true,
      Cell: ({ cell }) => (
        <Typography variant="body2">
          {cell.getValue<number>()} DAP
        </Typography>
      ),
    },
    {
      accessorKey: 'planned_start_date',
      header: 'Planned Start',
      size: 130,
      enableEditing: true,
      Cell: ({ cell }) => (
        <Typography variant="body2">
          {new Date(cell.getValue<string>()).toLocaleDateString()}
        </Typography>
      ),
      muiEditTextFieldProps: {
        type: 'date',
      },
    },
    {
      accessorKey: 'planned_end_date',
      header: 'Planned End',
      size: 130,
      enableEditing: true,
      Cell: ({ cell }) => (
        <Typography variant="body2">
          {new Date(cell.getValue<string>()).toLocaleDateString()}
        </Typography>
      ),
      muiEditTextFieldProps: {
        type: 'date',
      },
    },
    {
      accessorKey: 'planned_rate',
      header: 'Planned Rate',
      size: 120,
      enableEditing: true,
      Cell: ({ cell }) => (
        <Typography variant="body2">
          {(cell.getValue<number>() || 0).toFixed(1)}
        </Typography>
      ),
    },
    {
      accessorKey: 'method',
      header: 'Method',
      size: 120,
      enableEditing: true,
      Cell: ({ cell }) => (
        <Typography variant="body2">
          {cell.getValue<string>()}
        </Typography>
      ),
      muiEditTextFieldProps: {
        select: true,
        children: methodOptions.map((option) => (
          <MenuItem key={option} value={option.toLowerCase()}>
            {option}
          </MenuItem>
        )),
      },
    },
  ], [productOptions, methodOptions]);

  // Work package columns (Level 3 - Leaf)
  const workPackageColumns = useMemo<MRT_ColumnDef<WorkPackageNode>[]>(() => [
    {
      accessorKey: 'days_after_planting',
      header: 'Days After Planting',
      size: 140,
      enableEditing: true,
      Cell: ({ cell }) => (
        <Typography variant="body2">
          {cell.getValue<number>()} DAP
        </Typography>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      size: 120,
      enableEditing: true,
      Cell: ({ cell }) => (
        <Typography variant="body2">
          {new Date(cell.getValue<string>()).toLocaleDateString()}
        </Typography>
      ),
      muiEditTextFieldProps: {
        type: 'date',
      },
    },
    {
      accessorKey: 'area',
      header: 'Area (hectares)',
      size: 130,
      enableEditing: true,
      Cell: ({ cell }) => (
        <Typography variant="body2">
          {(cell.getValue<number>() || 0).toFixed(1)} ha
        </Typography>
      ),
    },
    {
      accessorKey: 'rate',
      header: 'Rate',
      size: 100,
      enableEditing: true,
      Cell: ({ cell }) => (
        <Typography variant="body2">
          {(cell.getValue<number>() || 0).toFixed(1)}
        </Typography>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      size: 120,
      enableEditing: true,
      Cell: ({ cell }) => (
        <Typography variant="body2" fontWeight="medium">
          {(cell.getValue<number>() || 0).toFixed(1)}
        </Typography>
      ),
    },
  ], []);

  // Main table configuration
  const table = useMaterialReactTable({
    columns: blocColumns,
    data,
    enableExpanding: true,
    enableExpandAll: true,
    enableEditing: true,
    editDisplayMode: 'cell',
    initialState: {
      expanded: true,
      density: 'compact',
    },
    getSubRows: (originalRow) => originalRow.products as any,
    renderDetailPanel: ({ row }) => {
      const bloc = row.original;

      return (
        <Box sx={{ p: 2, bgcolor: 'primary.25', borderRadius: 1, mt: 1 }}>
          {/* PRODUCTS TABLE */}
          {bloc.products && bloc.products.length > 0 && (
            <MaterialReactTable
              columns={productColumns}
              data={bloc.products}
              enableExpanding={true}
              enableEditing={true}
              editDisplayMode="cell"
              getSubRows={(originalRow) => originalRow.work_packages as any}
              renderDetailPanel={({ row: productRow }) => {
                const product = productRow.original;

                return (
                  <Box sx={{ p: 1, bgcolor: 'secondary.25', borderRadius: 1, mt: 1 }}>
                    {/* WORK PACKAGES TABLE */}
                    {product.work_packages && product.work_packages.length > 0 && (
                      <MaterialReactTable
                        columns={workPackageColumns}
                        data={product.work_packages}
                        enablePagination={false}
                        enableTopToolbar={false}
                        enableBottomToolbar={false}
                        enableEditing={true}
                        editDisplayMode="cell"
                        enableRowActions={true}
                        renderRowActions={({ row: workPackageRow }) => (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Add Work Package">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => addWorkPackage(bloc.id, product.id)}
                              >
                                <Add fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Work Package">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => deleteWorkPackage(bloc.id, product.id, workPackageRow.original.id)}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                        muiTableProps={{
                          sx: {
                            '& .MuiTableCell-root': { py: 0.5 },
                            '& .MuiTableHead-root': {
                              '& .MuiTableCell-head': {
                                backgroundColor: 'success.25',
                                color: 'success.600',
                                fontWeight: 'normal',
                                fontSize: '0.875rem',
                                borderBottom: '1px solid',
                                borderBottomColor: 'success.100',
                              }
                            },
                            '& .MuiTableBody-root .MuiTableRow-root': {
                              bgcolor: 'white',
                              '&:hover': { bgcolor: 'success.25' }
                            },
                            border: '1px solid',
                            borderColor: 'success.100',
                            borderRadius: 1,
                            bgcolor: 'white'
                          }
                        }}
                      />
                    )}
                    {(!product.work_packages || product.work_packages.length === 0) && (
                      <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          No work packages yet
                        </Typography>
                        <Button
                          startIcon={<Add />}
                          size="small"
                          variant="outlined"
                          sx={{ mt: 1 }}
                          onClick={() => addWorkPackage(bloc.id, product.id)}
                        >
                          Add Work Package
                        </Button>
                      </Box>
                    )}

                    {/* PRODUCT FOOTER - Only show if there are work packages */}
                    {product.work_packages && product.work_packages.length > 0 && (
                    <Card sx={{ mt: 2, bgcolor: 'secondary.50', border: '1px solid', borderColor: 'secondary.200' }}>
                      <Box sx={{ p: 1.5 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={2.4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" sx={{ minWidth: 60, color: 'secondary.700' }}>
                                Progress:
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={product.progress || 0}
                                sx={{
                                  flex: 1,
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: 'rgba(0,0,0,0.1)'
                                }}
                                color={(product.progress || 0) >= 80 ? 'success' : (product.progress || 0) >= 50 ? 'warning' : 'error'}
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={2.4}>
                            <Typography variant="body2" sx={{ color: 'secondary.700' }}>
                              Est. Product Cost: ${(product.est_product_cost || 0).toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={2.4}>
                            <Typography variant="body2" sx={{ color: 'secondary.700' }}>
                              Est. Resource Cost: ${(product.est_resource_cost || 0).toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={2.4}>
                            <Typography variant="body2" sx={{ color: 'secondary.700' }}>
                              Act. Product Cost: ${(product.act_product_cost || 0).toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={2.4}>
                            <Typography variant="body2" sx={{ color: 'secondary.700' }}>
                              Act. Resource Cost: ${(product.act_resource_cost || 0).toLocaleString()}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Card>
                    )}
                  </Box>
                );
              }}
              enableRowActions={true}
              renderRowActions={({ row: productRow }) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Add Product">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => addProduct(bloc.id)}
                    >
                      <Add fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Product">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => deleteProduct(bloc.id, productRow.original.id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
              muiTableProps={{
                sx: {
                  '& .MuiTableCell-root': { py: 1 },
                  '& .MuiTableHead-root': {
                    '& .MuiTableCell-head': {
                      backgroundColor: 'secondary.50',
                      color: 'secondary.700',
                      fontWeight: 'medium',
                      borderBottom: '1px solid',
                      borderBottomColor: 'secondary.200',
                    }
                  },
                  '& .MuiTableBody-root .MuiTableRow-root': {
                    bgcolor: 'grey.25',
                    '&:hover': { bgcolor: 'secondary.25' }
                  },
                  border: '1px solid',
                  borderColor: 'secondary.200',
                  borderRadius: 1,
                  bgcolor: 'grey.25'
                }
              }}
              enablePagination={false}
              enableTopToolbar={true}
              enableBottomToolbar={false}
            />
          )}
          {(!bloc.products || bloc.products.length === 0) && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No products yet
              </Typography>
              <Button
                startIcon={<Add />}
                size="small"
                variant="outlined"
                sx={{ mt: 1 }}
                onClick={() => addProduct(bloc.id)}
              >
                Add Product
              </Button>
            </Box>
          )}

          {/* BLOC FOOTER */}
          <Card sx={{
            mt: 2,
            bgcolor: 'primary.100',
            border: '1px solid',
            borderColor: 'primary.200',
            borderBottom: '2px solid',
            borderBottomColor: 'primary.200',
          }}>
            <Box sx={{ p: 1.5 }}>
              <Grid container spacing={2}>
                <Grid item xs={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ minWidth: 60, color: 'primary.800', fontWeight: 'bold' }}>
                      Progress:
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={bloc.progress || 0}
                      sx={{
                        flex: 1,
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'rgba(0,0,0,0.1)'
                      }}
                      color={(bloc.progress || 0) >= 80 ? 'success' : (bloc.progress || 0) >= 50 ? 'warning' : 'error'}
                    />
                  </Box>
                </Grid>
                <Grid item xs={2.5}>
                  <Typography variant="body2" sx={{ color: 'primary.800', fontWeight: 'medium' }}>
                    Est. Product Cost: ${(bloc.total_est_product_cost || 0).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={2.5}>
                  <Typography variant="body2" sx={{ color: 'primary.800', fontWeight: 'medium' }}>
                    Est. Resource Cost: ${(bloc.total_est_resource_cost || 0).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={2.5}>
                  <Typography variant="body2" sx={{ color: 'primary.800', fontWeight: 'medium' }}>
                    Act. Product Cost: ${(bloc.total_act_product_cost || 0).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={2.5}>
                  <Typography variant="body2" sx={{ color: 'primary.800', fontWeight: 'medium' }}>
                    Act. Resource Cost: ${(bloc.total_act_resource_cost || 0).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Box>
      );
    },
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        backgroundColor: 'rgba(25, 118, 210, 0.04)',
      },
    }),
    muiTableProps: {
      sx: {
        border: '1px solid',
        borderColor: 'primary.200',
        borderRadius: 1,
        borderTop: '3px solid',
        borderTopColor: 'primary.400',
        '& .MuiTableHead-root': {
          '& .MuiTableCell-head': {
            backgroundColor: 'primary.100',
            color: 'primary.800',
            fontWeight: 'bold',
            borderBottom: '2px solid',
            borderBottomColor: 'primary.200',
          },
        },
        '& .MuiTableBody-root': {
          '& .MuiTableRow-root': {
            backgroundColor: 'primary.25',
            '&:hover': {
              backgroundColor: 'primary.50',
            },
          },
        },
      },
    },
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="Add Bloc">
          <IconButton
            size="small"
            color="primary"
            onClick={addBloc}
          >
            <Add fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Bloc">
          <IconButton
            size="small"
            color="error"
            onClick={() => deleteBloc(row.original.id)}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  });

  return (
    <Box>


      {/* Main Nested Table */}
      <MaterialReactTable table={table} />

      {/* Summary Card */}
      <Card sx={{ mt: 2, p: 2, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AttachMoney />
          Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Typography variant="body2">
              Total Blocs: {data.length}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2">
              Total Area: {data.reduce((sum, bloc) => sum + (bloc.area_hectares || 0), 0).toFixed(1)} ha
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2">
              Avg Progress: {Math.round(data.reduce((sum, bloc) => sum + (bloc.progress || 0), 0) / data.length)}%
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2">
              Total Est Cost: ${data.reduce((sum, bloc) => sum + (bloc.total_est_product_cost || 0) + (bloc.total_est_resource_cost || 0), 0).toLocaleString()}
            </Typography>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default NestedTableApproach;
