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

// Import types (adjust path as needed)
import { BlocNode, ProductNode, WorkPackageNode, NestedTableApproachProps } from '../types/TableTypes';
import { sampleBlocData, productOptions, methodOptions } from '../data/sampleData';

export const NestedTableApproach: React.FC<NestedTableApproachProps> = ({
  initialData = sampleBlocData,
  onDataChange,
  readOnly = false,
  showSummary = true
}) => {
  const [data, setData] = useState<BlocNode[]>(initialData);

  // Update parent component when data changes
  const updateData = (newData: BlocNode[]) => {
    setData(newData);
    onDataChange?.(newData);
  };

  // Function to add a new bloc
  const addBloc = () => {
    const newBloc: BlocNode = {
      id: `bloc_${Date.now()}`,
      name: 'New Bloc',
      area_hectares: 0,
      cycle_number: [1],
      variety_name: '',
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
    updateData([newBloc, ...data]);
  };

  // Function to add a new product to a bloc
  const addProduct = (blocId: string) => {
    const newProduct: ProductNode = {
      id: `prod_${Date.now()}`,
      product_name: 'Prepare Land',
      days_after_planting: 0,
      planned_start_date: new Date().toISOString().split('T')[0],
      planned_end_date: new Date().toISOString().split('T')[0],
      planned_rate: 0,
      method: 'manual',
      progress: 0,
      est_product_cost: 0,
      est_resource_cost: 0,
      act_product_cost: 0,
      act_resource_cost: 0,
      work_packages: []
    };

    updateData(data.map(bloc =>
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

    updateData(data.map(bloc =>
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

  // Delete functions
  const deleteBloc = (blocId: string) => {
    updateData(data.filter(bloc => bloc.id !== blocId));
  };

  const deleteProduct = (blocId: string, productId: string) => {
    updateData(data.map(bloc =>
      bloc.id === blocId
        ? { ...bloc, products: (bloc.products || []).filter(product => product.id !== productId) }
        : bloc
    ));
  };

  const deleteWorkPackage = (blocId: string, productId: string, workPackageId: string) => {
    updateData(data.map(bloc =>
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

  // Memoized options to prevent re-renders
  const memoizedProductOptions = useMemo(() => productOptions, []);
  const memoizedMethodOptions = useMemo(() => methodOptions, []);

  // Main bloc columns (Level 1 - Root)
  const blocColumns = useMemo<MRT_ColumnDef<BlocNode>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Bloc Name',
      size: 150,
      enableEditing: !readOnly,
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
      enableEditing: !readOnly,
      Cell: ({ cell }) => (
        <Typography variant="body2">
          {(cell.getValue<number>() || 0).toFixed(1)} ha
        </Typography>
      ),
    },
    {
      accessorKey: 'variety_name',
      header: 'Variety',
      size: 140,
      enableEditing: !readOnly,
    },
    {
      accessorKey: 'progress',
      header: 'Progress',
      size: 120,
      enableEditing: !readOnly,
      Cell: ({ cell }) => {
        const progress = cell.getValue<number>() || 0;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ 
                width: 60, 
                height: 6,
                borderRadius: 3,
                backgroundColor: 'primary.100',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'primary.600'
                }
              }}
            />
            <Typography variant="caption" sx={{ minWidth: 35, color: 'primary.700' }}>
              {progress}%
            </Typography>
          </Box>
        );
      },
    }
  ], [readOnly]);

  // Continue with the rest of the component...
  // (This file will be extended with the remaining columns and render logic)

  return (
    <Box>
      {/* Component implementation continues... */}
      <Typography variant="h6" gutterBottom>
        Agricultural Nested Table Component
      </Typography>
      <Typography variant="body2" color="text.secondary">
        This is a placeholder. The full component implementation will be provided in the complete file.
      </Typography>
    </Box>
  );
};
