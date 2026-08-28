"use client";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Save, Share } from "lucide-react";

type Props = {
  selectedTab: (value: string) => void;
};

const WorkspaceHeader = ({ selectedTab }: Props) => {
  return (
    <div className="p-3 border-b flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Image src={"/logo.svg"} alt="Logo" width={35} height={35} />
        <h2>Workspace Name</h2>
      </div>
      {/* Switch */}
      <div>
        <Tabs
          defaultValue="whiteboard"
          onValueChange={(value) => selectedTab(value)}
        >
          <TabsList>
            <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
            <TabsTrigger value="doc">Docs</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {/* Extra Button */}
      <div className="flex items-center gap-2">
        <Button>
          <Save />
          Save
        </Button>
        <Button variant="outline">
          <Share />
          Share
        </Button>
      </div>
    </div>
  );
};

export default WorkspaceHeader;
