import { MessageLoading } from "@/components/ui/message-loading";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      <div className="text-center flex flex-col items-center">
        {/* Message Loading animation */}
        <div className="flex items-center gap-2">
          <MessageLoading />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
