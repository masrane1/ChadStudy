import { useState } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import SettingsForm from "@/components/admin/settings-form";

export default function SettingsManagement() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 p-6 md:p-10 overflow-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Paramètres du site</h1>
            <p className="text-gray-600">Personnalisez le pied de page et les informations de contact</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <SettingsForm />
        </div>
      </div>
    </div>
  );
}