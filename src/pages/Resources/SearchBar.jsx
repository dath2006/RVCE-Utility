import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SearchBar = ({ value, onChange, className = "" }) => {
  return (
    <div
      className={`relative flex w-full min-w-0 items-center ${className}`.trim()}
    >
      <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search files..."
        value={value}
        className="h-10 rounded-lg pl-9 pr-9"
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 h-8 w-8"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default SearchBar;
