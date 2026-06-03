"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="flex flex-col min-h-screen pt-24 pb-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="mx-auto w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mb-8 border border-orange-500/30">
             <FileText className="h-10 w-10 text-orange-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
            Documentation & Compliance
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Maintain perfect records, automate audits, and ensure 100% legal compliance for your SHG.
          </p>
          
          <div className="mt-16 p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm max-w-2xl mx-auto">
             <h2 className="text-2xl font-semibold text-white mb-4">Compliance Suite Beta</h2>
             <p className="text-gray-400">Our compliance tracking and automated documentation tools will be available soon.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
