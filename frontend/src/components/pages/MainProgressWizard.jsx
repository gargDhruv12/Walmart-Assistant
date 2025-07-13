import React, { useState } from 'react';
import { Stepper, Step, StepLabel, Button, Paper, Box } from '@mui/material';
import Dashboard from './Dashboard';
import SupplierFinder from './SupplierFinder';
import TariffChecker from './TariffChecker';
import RoutePlanner from './RoutePlanner';
import CostEstimator from './CostEstimator';

const steps = [
  'Dashboard',
  'Supplier Finder',
  'Tariff Checker',
  'Route Planner',
  'Cost Estimator'
];

const stepComponents = [
  Dashboard,
  SupplierFinder,
  TariffChecker,
  RoutePlanner,
  CostEstimator
];

export default function MainProgressWizard() {
  const [activeStep, setActiveStep] = useState(0);
  const StepComponent = stepComponents[activeStep];

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleReset = () => setActiveStep(0);

  return (
    <Paper sx={{ maxWidth: 900, mx: 'auto', mt: 5, p: 3 }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box sx={{ minHeight: 400 }}>
        <StepComponent />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined">Back</Button>
        {activeStep < steps.length - 1 ? (
          <Button onClick={handleNext} variant="contained">Next</Button>
        ) : (
          <Button onClick={handleReset} color="secondary" variant="contained">Reset</Button>
        )}
      </Box>
    </Paper>
  );
} 