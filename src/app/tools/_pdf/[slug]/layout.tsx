import { ToolWorkflowProvider } from '@/features/pdf/context/ToolWorkflowContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ToolWorkflowProvider>
      {children}
    </ToolWorkflowProvider>
  );
}
