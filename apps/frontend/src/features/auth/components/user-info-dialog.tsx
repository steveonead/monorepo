import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useUser } from '@/features/auth/hooks/use-user';

export default function UserInfoDialog() {
  const { data } = useUser(1);

  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{data ?? ''}</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your
            data from our servers.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
