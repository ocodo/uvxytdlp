import { UvxYtdlpIcon } from "@/components/branding/uvxytdlp-icon";
import {
  gridButtonClasses,
  gridClasses,
  gridNameClasses,
  listButtonClasses,
  listClasses,
  listNameClasses,
  roundButtonClasses,
  thinIconStyle,
} from "@/lib/style";
import LongPressButton from "@/components/ocodo-ui/long-press-button";
import { useApiBase } from "@/contexts/api-base-context";
import {
  useDownloaded,
  type DownloadedFileType,
} from "@/contexts/downloaded-context";
import {
  DownloadIcon,
  EllipsisVerticalIcon,
  PlayIcon,
  Trash2Icon,
} from "lucide-react";

import { Img } from "react-image";
import { cn } from "@/lib/utils";
import { type FC } from "react";

interface DowloadedFileProps {
  file: DownloadedFileType;
  handlePlay: (name: string) => void;
  handleDelete: (name: string) => void;
  handleDownload: (name: string) => void;
  selectedFile?: string;
  isDeleting?: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const DowloadedFile: FC<DowloadedFileProps> = (props) => {
  const {
    file,
    handlePlay,
    handleDownload,
    handleDelete,
    isDeleting,
    isExpanded,
    onToggleExpand,
  } = props;

  const { apiBase } = useApiBase();
  const { viewType } = useDownloaded();
  const isGrid = viewType === "grid";
  const isList = viewType === "list";

  const formatDuration = (duration: string | null) => {
    if (!duration) return "";
    return duration.includes(":") ? duration : `${duration}s`;
  };

  const ContentImage = () => (
    <div
      className={`flex flex-col justify-center items-center relative gap-1 bg-black group ${isExpanded ? 'rounded-xl' : 'rounded-t-xl'}`}
      onClick={() => handlePlay(file.name)}
    >
      <div
        className="
          absolute cursor-pointer opacity-10 group-hover:opacity-100
          transition-opacity duration-500 rounded-full bg-background/30
          w-20 h-20 mb-[22px] flex items-center justify-center
        "
      >
        <PlayIcon
          style={{ stroke: "#fff", ...thinIconStyle }}
          className="w-12 h-12 ml-[3px]"
        />
      </div>

      <div className="rounded-t-xl overflow-hidden w-full h-[200px] flex items-center justify-center">
        <Img
          className="object-cover"
          src={`${apiBase}/thumbnail/${file.name}`}
          unloader={
            <UvxYtdlpIcon
              className="mb-[1.4em]"
              size={170}
              fadeDuration={500}
              totalDuration={1000}
              colors={["#6004", "#0604", "#0064"]}
            />
          }
        />
      </div>
    </div>
  );

  const PlayButtonControl = () => (
    <div className={roundButtonClasses} onClick={() => handlePlay(file.name)}>
      <PlayIcon className="h-6 w-6 ml-[3px]" style={thinIconStyle} />
    </div>
  );

  const DownloadButtonControl = () => (
    <div className={roundButtonClasses} onClick={() => handleDownload(file.name)}>
      <DownloadIcon className="h-6 w-6" style={thinIconStyle} />
    </div>
  );

  const DeleteButtonControl = () => (
    <LongPressButton
      onLongPress={() => handleDelete(file.name)}
      longPressDuration={1000}
      fillUpColorClass="dark:bg-red-700 bg-red-700"
      className="cursor-pointer animate-color hover:border-red-700 border border-transparent animate-all duration-500"
    >
      {isDeleting === file.name ? (
        <Trash2Icon style={thinIconStyle} className="animate-pulse" />
      ) : (
        <Trash2Icon style={thinIconStyle} />
      )}
    </LongPressButton>
  );

  const MoreButtonControl = () => (
    <EllipsisVerticalIcon
      style={thinIconStyle}
      onClick={onToggleExpand}
      className={cn(roundButtonClasses, "cursor-pointer w-10 h-10")}
    />
  );

  if (!isExpanded) {
    return (
      <div className={isList ? listClasses : gridClasses}>
        {isGrid && <ContentImage />}

        <div className={isList ? listNameClasses : gridNameClasses}>
          {file.title || file.name}
          <div className="text-xs">{formatDuration(file.duration)}</div>
        </div>

        <div className={isList ? listButtonClasses : gridButtonClasses}>
          <PlayButtonControl />
          <DownloadButtonControl />
          <DeleteButtonControl />
          <MoreButtonControl />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(gridClasses, "col-span-full p-4")}>
      <div className="flex flex-row gap-4 items-start">

        <div className="w-1/4 min-w-[180px]">
          <ContentImage />
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <div className="font-bold text-lg">{file.title || file.name}</div>
          <div className="text-xs">{formatDuration(file.duration)}</div>

          {/* Placeholder expanded content */}
          <div className="text-sm opacity-70">
            Expanded view — add your future metadata/details here.
          </div>

          <div className="flex flex-row gap-2 mt-2">
            <PlayButtonControl />
            <DownloadButtonControl />
            <DeleteButtonControl />
            <MoreButtonControl /> {/* This now closes it */}
          </div>
        </div>

      </div>
    </div>
  );
};
