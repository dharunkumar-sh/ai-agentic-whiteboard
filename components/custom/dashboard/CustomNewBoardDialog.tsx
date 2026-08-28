import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface CustomNewBoardDialogProps {
  trigger?: React.ReactElement;
  children?: React.ReactElement;
  className?: string;
}

const CustomNewBoardDialog = ({
  trigger,
  children,
  className,
}: CustomNewBoardDialogProps) => {
  const [open, setOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateBoard = async () => {
    if (workspaceName.trim() === "" || workspaceName.length > 30) {
      toast.add({
        type: "error",
        title: "Invalid Workspace Name",
        description: "Please enter a valid workspace name (1-30 characters)",
      });
      return;
    }

    try {
      setLoading(true);
      const projectId = crypto.randomUUID();
      const result = await axios.post("/api/projects", {
        projectName: workspaceName,
        projectId: projectId,
      });
      console.log("Created board:", result.data);

      toast.add({
        type: "success",
        title: "New Workspace Created",
        description: "Workspace Created Successfully!",
      });
      setWorkspaceName("");
      setOpen(false);
      router.push("/workspace/" + projectId);
    } catch (error: any) {
      console.error("Error creating board:", error);
      toast.add({
        type: "error",
        title: "Creation Failed",
        description:
          error.response?.data?.error || "Failed to create new workspace",
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerElement = trigger || children || (
    <Button className={className || "w-auto"}>
      <Plus /> Create New Board
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={triggerElement} />
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className={"text-lg font-bold"}>
            Whiteboard Workspace Name
          </DialogTitle>
          <div>
            <label className="text-gray-500">
              Enter Whiteboard Workspace Name
            </label>
            <Input
              placeholder="Workspace Name"
              className="mt-1"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
            />
          </div>
        </DialogHeader>

        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button
            onClick={handleCreateBoard}
            disabled={workspaceName?.length == 0 || loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomNewBoardDialog;
