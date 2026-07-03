import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cn } from "@orasage/ui";

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
export { cardVariants } from "@orasage/ui";
export type { CardProps } from "@orasage/ui";
