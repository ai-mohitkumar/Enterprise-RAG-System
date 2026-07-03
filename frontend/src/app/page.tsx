/**
 * Home page - Main chat and documents interface
 */

"use client";

import React, { useState } from "react";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { FileUpload } from "@/components/Documents/FileUpload";
import { DocumentList } from "@/components/Documents/DocumentList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/Common/Tabs";
import { useDocuments } from "@/hooks/useDocuments";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("chat");
  const [documentsRefreshKey, setDocumentsRefreshKey] = useState(0);
  const [uploadResetKey, setUploadResetKey] = useState(0);
  const [documentsMessage, setDocumentsMessage] = useState<string | null>(null);
  const {
    uploadDocument,
    uploadMultiple,
    uploading,
    uploadProgress,
    error: uploadError,
  } = useDocuments({
    onError: (error) => setDocumentsMessage(error),
    onSuccess: (message) => setDocumentsMessage(message),
  });

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;

    const response =
      files.length === 1
        ? await uploadDocument(files[0])
        : await uploadMultiple(files);

    if (response) {
      setDocumentsRefreshKey((current) => current + 1);
      setUploadResetKey((current) => current + 1);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="border-b border-neutral-200 dark:border-secondary-700 rounded-none px-4 sm:px-6">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 overflow-hidden">
          <ChatContainer onError={(error) => console.error(error)} />
        </TabsContent>

        <TabsContent value="documents" className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-secondary-900 dark:text-neutral-100">
                Documents
              </h2>
              <p className="mt-1 text-sm text-secondary-600 dark:text-neutral-400">
                Upload knowledge sources here, then query them from chat or with file attachments.
              </p>
            </div>

            <FileUpload
              onFilesSelected={handleFilesSelected}
              loading={uploading}
              resetKey={uploadResetKey}
            />

            {(documentsMessage || uploadError || uploading) && (
              <div className="rounded-lg border border-neutral-200 dark:border-secondary-700 bg-neutral-50 dark:bg-secondary-800/60 px-4 py-3 text-sm text-secondary-700 dark:text-neutral-300">
                {uploading
                  ? `Uploading documents... ${uploadProgress}%`
                  : documentsMessage || uploadError}
              </div>
            )}

            <DocumentList refreshKey={documentsRefreshKey} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
