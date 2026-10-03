import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FaFileInvoiceDollar } from 'react-icons/fa6';
import { Button } from '@/components/ui';
import { invoiceService } from '@/services/invoiceService';
import type { MemberInvoice } from '@/types/invoices';

interface GenerateInvoiceButtonProps {
  memberId: string | number;
  memberName?: string;
  hasExistingInvoice?: boolean;
  onInvoiceGenerated?: (invoice: MemberInvoice) => void;
  size?: 'xs' | 'sm' | 'md';
}

export const GenerateInvoiceButton = ({
  memberId,
  memberName,
  hasExistingInvoice = false,
  onInvoiceGenerated,
  size = 'xs',
}: GenerateInvoiceButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsGenerating(true);
      const res = await invoiceService.generateInvoice(memberId);
      toast.success(
        `Invoice ${res.invoiceNumber} generated${memberName ? ` for ${memberName}` : ''}!`
      );
      if (onInvoiceGenerated) {
        onInvoiceGenerated(res.invoice);
      }
    } catch {
      toast.error('Failed to generate invoice');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant={hasExistingInvoice ? 'outline' : 'primary'}
      size={size}
      isLoading={isGenerating}
      leftIcon={<FaFileInvoiceDollar className="size-3" />}
      onClick={handleGenerate}
    >
      Generate Invoice
    </Button>
  );
};
