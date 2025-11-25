import { cn } from "@/lib/utils";

export const thinIconStyle = {strokeWidth: 0.5};
/*export const controlIconClassName = `text-black/80 hover:text-black
                                        hover:bg-white bg-white/30
                                        border-1 border-black/30
                                        transition-all duration-500
                                        p-1 rounded-full
                                        cursor-pointer`;
*/
export const controlIconClassName = cn(
    "hover:bg-accent/20 w-6 h-6",
    "rounded-full cursor-pointer",
    "p-2 hover:bg-foreground/10 w-10 h-10 rounded-full",
  );

export const roundButtonClasses = `rounded-full hover:bg-foreground/20 cursor-pointer p-2 animate-all duration-500`

export const gridClasses = `grid grid-cols-1 rounded-xl shadow-xl hover:shadow-2xl bg-card`
export const listClasses = `flex flex-row items-end justify-between
                            even:bg-background/10 odd:bg-background/80
                            align-bottom border-b py-3 sm:py-1`

export const gridNameClasses = "bg-background pt-2 px-4 truncate sm:whitespace-normal text-xs"
export const listNameClasses = "px-3 py-2 truncate sm:whitespace-normal"

export const gridButtonClasses = "flex flex-row bg-background rounded-b-xl items-center justify-center gap-x-6 pb-2"
export const listButtonClasses = "flex flex-row items-center justify-end  gap-x-6"

export const inputResetIconClasses = `cursor-pointer hover:bg-card/10 transition-color duration-500
                                      text-foreground/50 hover:text-foreground
                                      absolute right-1 top-1/2 -translate-y-1/2`

export const extClasses = `rounded-full bg-primary text-primary-foreground text-xs px-2 p-1 w-fit`
