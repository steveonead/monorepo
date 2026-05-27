import type { Campaign } from '@superdsp/api-schemas/campaigns/campaign';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteCampaign } from '@/features/campaign/queries/use-delete-campaign';

type DeleteCampaignDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: Campaign;
};

export function DeleteCampaignDialog({ open, onOpenChange, campaign }: DeleteCampaignDialogProps) {
  const deleteCampaign = useDeleteCampaign();

  const handleConfirm = async () => {
    if (!campaign) return;
    await deleteCampaign.mutateAsync(campaign.id);
    onOpenChange(false);
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>確定刪除「{campaign?.name}」？</AlertDialogTitle>
          <AlertDialogDescription>此操作無法復原。</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleteCampaign.isPending}
            onClick={handleConfirm}
          >
            確定刪除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
