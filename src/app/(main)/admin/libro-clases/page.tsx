"use client";

import { AdminLibroClasesView } from "@/components/libro-clases/AdminLibroClasesView";
import { Button } from "@/components/ui/button";

export default function AdminLibroClasesPage() {
  return (
    <div>
      {/* Simple test button to verify UI components work */}
      <div className="p-4 bg-red-100 border-2 border-red-500 mb-4">
        <h2 className="text-xl font-bold text-red-800">TEST: UI Components</h2>
        <Button className="mr-2">Test Button 1</Button>
        <Button variant="secondary">Test Button 2</Button>
        <Button variant="destructive">Test Button 3</Button>
        <p className="mt-2 text-red-700">If you see this and buttons, UI library works!</p>
      </div>

      {/* Original component */}
      <AdminLibroClasesView view="overview" />
    </div>
  );
}
