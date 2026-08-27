"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { UserDetailContext } from "@/context/UserDetailContext";

const Provider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded } = useUser();
  const [userDetail, setUserDetail] = useState<any>();
  useEffect(() => {
    if (isLoaded && user) {
      createNewUser();
    }
  }, [isLoaded, user]);

  const createNewUser = async () => {
    try {
      const result = await axios.post("/api/users");
      setUserDetail(result.data);
    } catch (error) {
      console.error("Error creating/fetching user:", error);
    }
  };

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      <div>{children}</div>
    </UserDetailContext.Provider>
  );
};

export default Provider;
