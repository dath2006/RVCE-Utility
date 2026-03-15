import React from "react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const BreadCrumbs = ({ path, onNavigate }) => {
  const handleClick = (index) => {
    onNavigate(path.slice(0, index + 1));
  };

  return (
    <div className="overflow-x-auto py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Breadcrumb>
        <BreadcrumbList className="flex-nowrap whitespace-nowrap">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => onNavigate([])}
              >
                Home
              </Button>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {path.map((item, index) => {
            const isLast = index === path.length - 1;

            return (
              <React.Fragment key={`${item}-${index}`}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="rounded-md px-2 py-1 text-sm font-medium">
                      {item}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => handleClick(index)}
                      >
                        {item}
                      </Button>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default BreadCrumbs;
