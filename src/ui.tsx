import * as React from "react";
import { createRoot } from "react-dom/client";
import { ChevronDownIcon, StarIcon, StarFilledIcon, Cross2Icon, BookmarkIcon } from "@radix-ui/react-icons";
import { SearchInput } from "./components/SearchInput";
import { Select } from "./components/Select";
import { Button } from "./components/Button";
import { Chip } from "./components/Chip";
import "./ui.css";

type Option = {
  id: string;
  label: string;
  description?: string;
  type: string;
};

type Section = {
  title: string;
  options: Option[];
  description?: string;
  hasSelect?: boolean;
  selectType?: string;
};

const sections: { [key: string]: Section } = {
  selection: {
    title: "Selection",
    options: [
      { id: "name", label: "Name", type: "get-instances-by-name", description: "Find instances with the same name" },
      { id: "type", label: "Type", type: "get-instances-by-type", description: "Find instances of the same type" },
    ],
    description: "Search based on selection properties",
  },
  geometry: {
    title: "Geometry",
    options: [
      { id: "size", label: "Size", type: "get-instances-by-size", description: "Find instances with the same width and height" },
      { id: "width", label: "Width", type: "get-instances-by-width", description: "Find instances with the same width" },
      { id: "height", label: "Height", type: "get-instances-by-height", description: "Find instances with the same height" },
      { id: "radius", label: "Corner Radius", type: "get-instances-by-radius", description: "Find instances with the same corner radius" },
    ],
    description: "Search based on geometric properties",
  },
  appearance: {
    title: "Appearance",
    options: [
      { id: "fills", label: "Fill Color", type: "get-instances-by-fills", description: "Find instances with the same fill color" },
      { id: "fillVisibility", label: "Fill Visibility", type: "get-instances-by-fillVisibility", description: "Find instances with the same fill visibility" },
      { id: "fillOpacity", label: "Fill Opacity", type: "get-instances-by-fillOpacity", description: "Find instances with the same fill opacity" },
      { id: "fillBlendMode", label: "Fill Blend Mode", type: "get-instances-by-fillBlendMode", description: "Find instances with the same fill blend mode" },
      { id: "strokes", label: "Stroke Color", type: "get-instances-by-strokes", description: "Find instances with the same stroke color" },
      { id: "strokeType", label: "Stroke Type", type: "get-instances-by-strokeType", description: "Find instances with the same stroke type" },
      { id: "strokeVisibility", label: "Stroke Visibility", type: "get-instances-by-strokeVisibility", description: "Find instances with the same stroke visibility" },
      { id: "strokeOpacity", label: "Stroke Opacity", type: "get-instances-by-strokeOpacity", description: "Find instances with the same stroke opacity" },
      { id: "strokeBlendMode", label: "Stroke Blend Mode", type: "get-instances-by-strokeBlendMode", description: "Find instances with the same stroke blend mode" },
      { id: "strokeWeight", label: "Stroke Weight", type: "get-instances-by-strokeWeight", description: "Find instances with the same stroke weight" },
      { id: "effects", label: "Effects", type: "get-instances-by-effects", description: "Find instances with the same effects" },
    ],
    description: "Search based on visual properties",
  },
  layout: {
    title: "Layout",
    options: [
      { id: "layoutMode", label: "Layout Mode", type: "get-instances-by-layoutMode", description: "Find instances with the same layout mode" },
      { id: "layoutSpacing", label: "Layout Spacing", type: "get-instances-by-layoutSpacing", description: "Find instances with the same layout spacing" },
      { id: "layoutPadding", label: "Layout Padding", type: "get-instances-by-layoutPadding", description: "Find instances with the same layout padding" },
      { id: "layoutAlignment", label: "Layout Alignment", type: "get-instances-by-layoutAlignment", description: "Find instances with the same layout alignment" },
      { id: "layoutGrow", label: "Layout Grow", type: "get-instances-by-layoutGrow", description: "Find instances with the same layout grow" },
    ],
    description: "Search based on layout properties",
  },
  text: {
    title: "Text",
    options: [
      { id: "textSize", label: "Text Size", type: "get-instances-by-textSize", description: "Find text layers with the same size" },
      { id: "fontName", label: "Font Name", type: "get-instances-by-fontName", description: "Find text layers with the same font name" },
      { id: "fontFamily", label: "Font Family", type: "get-instances-by-fontFamily", description: "Find text layers with the same font family" },
      { id: "fontStyle", label: "Font Style", type: "get-instances-by-fontStyle", description: "Find text layers with the same font style" },
      { id: "characters", label: "Characters", type: "get-instances-by-characters", description: "Find text layers with the same content" },
      { id: "letterSpacing", label: "Letter Spacing", type: "get-instances-by-letterSpacing", description: "Find text layers with the same letter spacing" },
      { id: "lineHeight", label: "Line Height", type: "get-instances-by-lineHeight", description: "Find text layers with the same line height" },
      { id: "textCase", label: "Text Case", type: "get-instances-by-textCase", description: "Find text layers with the same text case" },
      { id: "textDecoration", label: "Text Decoration", type: "get-instances-by-textDecoration", description: "Find text layers with the same text decoration" },
    ],
    description: "Search based on text properties",
    hasSelect: true,
    selectType: "font",
  },
  component: {
    title: "Component",
    options: [
      { id: "componentSet", label: "Component Set", type: "get-instances-by-componentSet", description: "Find instances from the same component set" },
      { id: "componentProperties", label: "Component Properties", type: "get-instances-by-componentProperties", description: "Find instances with the same component properties" },
      { id: "variantProperties", label: "Variant Properties", type: "get-instances-by-variantProperties", description: "Find instances with the same variant properties" },
    ],
    description: "Search based on component properties",
  },
  export: {
    title: "Export",
    options: [
      { id: "exportSettings", label: "Export Settings", type: "get-instances-by-exportSettings", description: "Find instances with the same export settings" },
      { id: "exportFormat", label: "Export Format", type: "get-instances-by-exportFormat", description: "Find instances with the same export format" },
    ],
    description: "Search based on export properties",
  },
};

type SearchHistoryItem = {
  id: string;
  timestamp: number;
  selections: string[];
  name?: string;
};

type SearchChip = {
  id: string;
  label: string;
  type: string;
};

type SavedSearch = {
  id: string;
  name: string;
  chips: SearchChip[];
  timestamp: number;
};

const App = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedFontName, setSelectedFontName] = React.useState("");
  const [favorites, setFavorites] = React.useState<SavedSearch[]>([]);
  const [searchHistory, setSearchHistory] = React.useState<SearchHistoryItem[]>([]);
  const [selectedOptions, setSelectedOptions] = React.useState<Option[]>([]);
  const [savedSearches, setSavedSearches] = React.useState<SavedSearch[]>([]);
  const [openSections, setOpenSections] = React.useState<{ [key: string]: boolean }>({
    selection: false,
    geometry: false,
    appearance: false,
    layout: false,
    text: false,
    component: false,
    constraints: false,
    export: false,
  });
  const [fontOptions, setFontOptions] = React.useState<Array<{ value: string; label: string }>>([]);
  const [selectedChips, setSelectedChips] = React.useState<SearchChip[]>([]);
  const [showFavorites, setShowFavorites] = React.useState(false);
  const [referenceNodeIndex, setReferenceNodeIndex] = React.useState(0);
  const [selectedNodes, setSelectedNodes] = React.useState<number>(0);
  const [searchName, setSearchName] = React.useState("");

  // Load saved data from Figma client storage
  React.useEffect(() => {
    parent.postMessage({ pluginMessage: { type: "load-client-storage" } }, "*");
  }, []);

  // Save data to Figma client storage whenever it changes
  React.useEffect(() => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "save-client-storage",
          favorites,
          searchHistory,
          savedSearches,
        },
      },
      "*"
    );
  }, [favorites, searchHistory, savedSearches]);

  React.useEffect(() => {
    window.onmessage = (event) => {
      const msg = event.data.pluginMessage;
      if (msg.type === "client-storage-loaded") {
        if (msg.favorites) setFavorites(msg.favorites);
        if (msg.searchHistory) setSearchHistory(msg.searchHistory);
        if (msg.savedSearches) setSavedSearches(msg.savedSearches);
      }
      if (msg.fontNames) {
        setFontOptions(
          msg.fontNames.map((font: string) => ({
            value: font,
            label: font,
          }))
        );
      }
      if (msg.styleNames) {
        setFontOptions(
          msg.styleNames.map((style: string) => ({
            value: style,
            label: style,
          }))
        );
      }
      if (msg.componentNames) {
        setFontOptions(
          msg.componentNames.map((component: string) => ({
            value: component,
            label: component,
          }))
        );
      }
      if (msg.type === "selectionChange") {
        setSelectedNodes(msg.count);
        // Reset reference node index when selection changes
        setReferenceNodeIndex(0);
        // Clear selected chips when selection changes
        setSelectedChips([]);
      }
    };
  }, []);

  const handleSelectChange = (value: string, type: string) => {
    parent.postMessage(
      {
        pluginMessage: {
          type: `get-instances-by-${type}Select`,
          pickFromSelect: value,
        },
      },
      "*"
    );
  };

  const handleOptionClick = (type: string, option: Option) => {
    parent.postMessage(
      {
        pluginMessage: {
          type: option.type,
          referenceNodeIndex,
        },
      },
      "*"
    );

    // Add to selected chips for refinement
    setSelectedChips((prevChips: SearchChip[]) => [
      ...prevChips,
      {
        id: option.id,
        label: option.label,
        type: option.type,
      },
    ]);

    // Add to search history
    addToHistory([option]);
  };

  const handleFontSelect = (value: string) => {
    setSelectedFontName(value);
    parent.postMessage(
      {
        pluginMessage: {
          type: "get-instances-by-findBySelect",
          pickFromSelect: value,
        },
      },
      "*"
    );
  };

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Improve search to handle fuzzy matching and auto-open sections
  const searchOptions = (options: Option[], query: string) => {
    if (!query) return options;
    const lowerQuery = query.toLowerCase();
    return options.filter((option) => {
      const matchesName = option.label.toLowerCase().includes(lowerQuery);
      const matchesType = option.type.toLowerCase().includes(lowerQuery);
      const matchesDescription = option.description?.toLowerCase().includes(lowerQuery);
      return matchesName || matchesType || matchesDescription;
    });
  };

  React.useEffect(() => {
    if (searchQuery) {
      // Auto-open sections with matching items
      const newOpenSections = { ...openSections };
      Object.entries(sections).forEach(([id, { options }]) => {
        const hasMatches = searchOptions(options, searchQuery).length > 0;
        newOpenSections[id] = hasMatches;
      });
      setOpenSections(newOpenSections);
    }
  }, [searchQuery]);

  // Add handlers for favorites and recently used
  const addToHistory = (selections: Option[]) => {
    const historyItem: SearchHistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      selections: selections.map((s) => s.type),
    };
    setSearchHistory((prev) => [historyItem, ...prev].slice(0, 10));
  };

  // Save current search
  const saveSearch = (name: string) => {
    if (selectedChips.length === 0) return;
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      chips: [...selectedChips],
      timestamp: Date.now(),
    };
    setSavedSearches((prev) => [newSearch, ...prev]);
  };

  // Add to favorites
  const addToFavorites = (search: SavedSearch) => {
    setFavorites((prev) => [...prev, search]);
  };

  // Remove from favorites
  const removeFromFavorites = (searchId: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== searchId));
  };

  const toggleFavorite = (option: Option) => {
    setFavorites((prev) => {
      const exists = prev.find((item) => item.id === option.id);
      if (exists) {
        return prev.filter((item) => item.id !== option.id);
      }
      // Convert Option to SavedSearch
      const newFavorite: SavedSearch = {
        id: option.id,
        name: option.label,
        chips: [{ id: option.id, label: option.label, type: option.type }],
        timestamp: Date.now(),
      };
      return [...prev, newFavorite];
    });
  };

  const renderSection = (title: string, id: string, options: Option[], description?: string, hasSelect?: boolean, selectType?: string) => {
    const filteredOptions = searchQuery ? searchOptions(options, searchQuery) : options;
    if (searchQuery && filteredOptions.length === 0) return null;

    return (
      <div className="w-full border-b border-figma-border last:border-0 pb-2 mb-2">
        <button className="flex w-full items-center justify-between py-2 hover:bg-figma-secondaryBg/50 px-2 rounded-md group" onClick={() => toggleSection(id)} title={description}>
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-figma-primary select-none">{title}</h3>
            </div>
            {description && <span className="text-xs text-figma-secondary opacity-0 group-hover:opacity-100 transition-opacity">{description}</span>}
          </div>
          <ChevronDownIcon className={`h-4 w-4 text-figma-primary transition-transform ${openSections[id] ? "rotate-180" : ""}`} />
        </button>
        {openSections[id] && (
          <div className="space-y-2 mt-2 px-2">
            {hasSelect && selectType === "font" && <Select value={selectedFontName} onValueChange={handleFontSelect} options={fontOptions} placeholder="Select a font..." />}
            <div className="grid grid-cols-2 gap-2 w-full">
              {filteredOptions.map((option) => (
                <div key={option.id} className="flex items-center gap-1">
                  <button className={`flex-1 rounded-md bg-figma-secondaryBg py-2 px-3 text-xs font-medium hover:bg-figma-secondaryBg-hover transition-colors relative group ${selectedOptions.some((o) => o.id === option.id) ? "ring-2 ring-figma-primary" : ""}`} onClick={() => handleOptionClick(option.type, option)} title={option.description}>
                    {option.label}
                    {option.description && (
                      <div className="absolute left-2 right-2 bottom-full mb-2 p-2 bg-figma-bg border border-figma-border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none whitespace-normal">
                        <span className="text-xs text-figma-secondary">{option.description}</span>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-figma-bg border-r border-b border-figma-border"></div>
                      </div>
                    )}
                  </button>
                  <button
                    className="p-1 rounded hover:bg-figma-secondaryBg"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(option);
                    }}
                    title={favorites.some((f) => f.id === option.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    {favorites.some((f) => f.id === option.id) ? <StarFilledIcon className="w-4 h-4 text-yellow-500" /> : <StarIcon className="w-4 h-4 text-figma-secondary" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Query builder suggestions
  const getQuerySuggestions = (query: string): Option[] => {
    const terms = query.toLowerCase().split(" ");
    return Object.values(sections)
      .flatMap((section) => section.options)
      .filter((option) => terms.every((term) => option.label.toLowerCase().includes(term) || option.type.toLowerCase().includes(term) || option.description?.toLowerCase().includes(term)));
  };

  // Handle query builder selection
  const handleQuerySelection = (option: Option) => {
    setSelectedChips([
      ...selectedChips,
      {
        id: option.id,
        label: option.label,
        type: option.type,
      },
    ]);
    setSearchQuery("");
  };

  // Execute combined search
  const executeCombinedSearch = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "combine-searches",
          searches: selectedChips.map((chip) => chip.type),
          referenceNodeIndex,
        },
      },
      "*"
    );
  };

  // Update the reference node selector component
  const ReferenceNodeSelector = () => {
    if (selectedNodes <= 1) return null;

    const [nodeInfo, setNodeInfo] = React.useState<Array<{ name: string; type: string }>>([]);

    React.useEffect(() => {
      // Request node info from the plugin whenever selection changes
      parent.postMessage(
        {
          pluginMessage: {
            type: "get-node-info",
          },
        },
        "*"
      );

      // Set up message handler for node info
      const handleMessage = (event: MessageEvent) => {
        const msg = event.data.pluginMessage;
        if (msg.type === "node-info") {
          setNodeInfo(msg.nodes);
        }
      };

      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    }, [selectedNodes]); // Re-run when selection changes

    const getNodeLabel = (index: number) => {
      if (!nodeInfo[index]) return `Node ${index + 1}`;
      const node = nodeInfo[index];
      // Truncate name to fit in dropdown while preserving type info
      const maxNameLength = 25;
      const typeLength = node.type.length + 3; // +3 for " ()" characters
      const availableSpace = maxNameLength - typeLength;

      const displayName = node.name.length > availableSpace ? node.name.substring(0, availableSpace - 3) + "..." : node.name;

      return `${displayName} (${node.type})`;
    };

    return (
      <div className="flex items-center gap-2">
        <Select
          value={String(referenceNodeIndex)}
          onValueChange={(value) => setReferenceNodeIndex(Number(value))}
          options={Array.from({ length: selectedNodes }, (_, i) => ({
            value: String(i),
            label: getNodeLabel(i),
          }))}
          placeholder="Choose reference node"
          className="min-w-[180px]"
        />
        <div className="text-xs text-figma-secondary">Used as reference for matching</div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white shadow-sm z-10 p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <SearchInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Type to build search query..." className="flex-1" suggestions={searchQuery ? getQuerySuggestions(searchQuery) : []} onSuggestionSelect={handleQuerySelection} />
            <Button variant={showFavorites ? "primary" : "outline"} onClick={() => setShowFavorites(!showFavorites)} className="min-w-[36px] h-9 p-0 relative flex items-center justify-center">
              {showFavorites ? <StarFilledIcon className="w-4 h-4 text-yellow-500" /> : <StarIcon className="w-4 h-4" />}
              {favorites.length > 0 && <span className="absolute -top-1 -right-1 text-[10px] bg-figma-blue text-white rounded-full px-1 min-w-[16px] h-4 flex items-center justify-center">{favorites.length}</span>}
            </Button>
          </div>

          <ReferenceNodeSelector />

          {selectedChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {selectedChips.map((chip) => (
                <Chip key={chip.id} label={chip.label} onRemove={() => setSelectedChips((chips) => chips.filter((c) => c.id !== chip.id))} />
              ))}
              <div className="flex gap-2">
                <Button size="small" variant="outline" onClick={() => setSelectedChips([])} className="text-sm">
                  Clear All
                </Button>
                <Button size="small" onClick={executeCombinedSearch} className="text-sm">
                  {selectedNodes === 1 ? "Get All" : selectedNodes > 0 ? "Refine Selection" : "Find"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {showFavorites ? (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-figma-primary">Favorites</h2>
              <span className="text-sm text-figma-secondary">{favorites.length} saved</span>
            </div>
            <div className="space-y-3">
              {favorites.map((favorite) => (
                <div key={favorite.id} className="p-3 rounded-lg border border-figma-border bg-white hover:bg-figma-secondaryBg/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-figma-primary">{favorite.name}</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => {
                          setSelectedChips(favorite.chips);
                          executeCombinedSearch();
                        }}
                        className="text-xs"
                      >
                        Apply
                      </Button>
                      <button onClick={() => removeFromFavorites(favorite.id)} className="text-figma-secondary hover:text-red-500 transition-colors">
                        <Cross2Icon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {favorite.chips.map((chip) => (
                      <Chip key={chip.id} label={chip.label} />
                    ))}
                  </div>
                </div>
              ))}
              {favorites.length === 0 && (
                <div className="text-center py-8 text-figma-secondary">
                  <StarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No favorites yet</p>
                  <p className="text-sm mt-1">Save your frequently used searches here</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex-1 overflow-y-auto space-y-2">
              {Object.entries(sections).map(([id, { title, options, description, hasSelect, selectType }]) => (
                <React.Fragment key={id}>{renderSection(title, id, options, description, hasSelect, selectType)}</React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save Search Dialog */}
      {selectedChips.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t p-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <SearchInput value={searchName} onChange={(e) => setSearchName(e.target.value)} placeholder="Name this search..." icon={BookmarkIcon} />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                if (!searchName.trim()) return;
                const newSearch: SavedSearch = {
                  id: Date.now().toString(),
                  name: searchName,
                  chips: selectedChips,
                  timestamp: Date.now(),
                };
                setFavorites((prev) => [...prev, newSearch]);
                setSearchName("");
              }}
              className="whitespace-nowrap"
            >
              Add to Favorites
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const root = createRoot(document.getElementById("react-page")!);
root.render(<App />);
