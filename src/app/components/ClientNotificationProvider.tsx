"use client";
//@ts-ignore
import { NotificationProvider } from '@web3uikit/core';

const ClientNotificationProvider = ({ children }:Readonly<{
    children: React.ReactNode;
  }>) => {
  return <NotificationProvider>{children}</NotificationProvider>;
};

export default ClientNotificationProvider;