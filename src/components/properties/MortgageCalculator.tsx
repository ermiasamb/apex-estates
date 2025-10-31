'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface MortgageCalculatorProps {
  propertyPrice: number;
}

export function MortgageCalculator({ propertyPrice }: MortgageCalculatorProps) {
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);

  const downPaymentAmount = useMemo(() => (propertyPrice * downPaymentPercent) / 100, [propertyPrice, downPaymentPercent]);
  const loanAmount = useMemo(() => propertyPrice - downPaymentAmount, [propertyPrice, downPaymentAmount]);

  const monthlyPayment = useMemo(() => {
    if (loanAmount <= 0) return 0;
    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    if (monthlyInterestRate === 0) return loanAmount / numberOfPayments;
    const numerator = monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments);
    const denominator = Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1;
    return loanAmount * (numerator / denominator);
  }, [loanAmount, interestRate, loanTerm]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Mortgage Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center bg-primary/10 text-primary p-4 rounded-lg">
            <span className="text-lg font-semibold">Estimated Monthly Payment</span>
            <span className="text-2xl font-bold">{formatCurrency(monthlyPayment)}</span>
        </div>
        
        <div className="space-y-4">
            <div>
                <Label>Property Price</Label>
                <Input value={formatCurrency(propertyPrice)} readOnly className="font-semibold text-base" />
            </div>
            <div>
                <div className="flex justify-between">
                    <Label>Down Payment</Label>
                    <span className="text-sm font-medium">{formatCurrency(downPaymentAmount)} ({downPaymentPercent}%)</span>
                </div>
                <Slider
                    value={[downPaymentPercent]}
                    onValueChange={(value) => setDownPaymentPercent(value[0])}
                    min={0}
                    max={100}
                    step={1}
                />
            </div>
             <div>
                <Label>Loan Amount</Label>
                <Input value={formatCurrency(loanAmount)} readOnly className="font-semibold text-base bg-muted" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <Label>Interest Rate (%)</Label>
                    <Input 
                        type="number" 
                        value={interestRate}
                        onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                        step="0.01"
                    />
                </div>
                <div>
                    <Label>Loan Term (Years)</Label>
                    <Input 
                        type="number"
                        value={loanTerm}
                        onChange={(e) => setLoanTerm(parseInt(e.target.value) || 0)}
                    />
                </div>
            </div>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Disclaimer: This is an estimate for informational purposes only. Consult with a financial advisor.
        </p>
      </CardContent>
    </Card>
  );
}
