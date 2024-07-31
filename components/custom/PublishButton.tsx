import { useState } from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

interface PublishButtonProps {
  disabled: boolean;
  isPublished: boolean;
  onClickPublish: () => Promise<void>;
}

const PublishButton = ({
  disabled,
  isPublished,
  onClickPublish,
}: PublishButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const handlePublish = async () => {
    setIsLoading(true);
    try {
      await onClickPublish();
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Button
      variant="outline"
      disabled={disabled || isLoading}
      onClick={handlePublish}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isPublished ? (
        "Unpublish"
      ) : (
        "Publish"
      )}
    </Button>
  );
};

export default PublishButton;
