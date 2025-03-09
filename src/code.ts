figma.showUI(__html__, { themeColors: true, width: 400, height: 500 });

// Listen for selection changes
figma.on("selectionchange", () => {
  const { selection } = figma.currentPage;
  figma.ui.postMessage({ type: "selectionChange", count: selection.length });
});

async function findAllFonts() {
  const nodes: string[] = [];

  figma.currentPage
    .findAll((node) => node.type === "TEXT")
    .forEach((node) => {
      if (node.type === "TEXT" && node.fontName !== figma.mixed) {
        nodes.push(node.fontName.family);
      }
    });

  const uniqueFonts = [...new Set(nodes)];
  const selectList = uniqueFonts.filter(Boolean);

  if (selectList.length === 0) {
    figma.ui.postMessage({
      fontNames: ["No text nodes found on this page"],
      noFontsFound: true,
    });
  } else {
    figma.ui.postMessage({ fontNames: selectList });
  }
}
findAllFonts();

figma.ui.onmessage = (msg) => {
  const { selection } = figma.currentPage;
  const referenceNodeIndex = msg.referenceNodeIndex || 0;
  const referenceNode = selection[referenceNodeIndex];

  // Handle client storage operations without requiring selection
  if (msg.type === "load-client-storage") {
    const loadData = async () => {
      try {
        const favorites = (await figma.clientStorage.getAsync("favorites")) || [];
        const searchHistory = (await figma.clientStorage.getAsync("searchHistory")) || [];
        const savedSearches = (await figma.clientStorage.getAsync("savedSearches")) || [];

        figma.ui.postMessage({
          type: "client-storage-loaded",
          favorites,
          searchHistory,
          savedSearches,
        });
      } catch (error) {
        console.error("Error loading data from client storage:", error);
      }
    };
    loadData();
    return;
  }

  if (msg.type === "request-fonts") {
    findAllFonts();
    return;
  }

  if (msg.type === "save-client-storage") {
    const saveData = async () => {
      try {
        await figma.clientStorage.setAsync("favorites", msg.favorites);
        await figma.clientStorage.setAsync("searchHistory", msg.searchHistory);
        await figma.clientStorage.setAsync("savedSearches", msg.savedSearches);
      } catch (error) {
        console.error("Error saving data to client storage:", error);
      }
    };
    saveData();
    return;
  }

  if (msg.type === "get-node-info") {
    const nodeInfo = selection.map((node) => ({
      name: node.name,
      type: node.type.toLowerCase(),
    }));
    figma.ui.postMessage({ type: "node-info", nodes: nodeInfo });
    return;
  }

  // Check for selection only for search-related operations
  if (!referenceNode && !msg.type.startsWith("save-") && msg.type !== "combine-searches") {
    figma.notify("Please select a node first");
    return;
  }

  if (msg.type === "get-instances-by-name") {
    const nodeName = referenceNode.name;
    const getInstances = figma.currentPage.findAll((node) => node.name === nodeName);
    figma.currentPage.selection = getInstances;
    figma.notify(`${getInstances.length} "${nodeName}" selected`);
  }

  if (msg.type === "get-instances-by-type") {
    const nodeType = referenceNode.type;
    const getInstances = figma.currentPage.findAll((node) => node.type === nodeType);
    figma.currentPage.selection = getInstances;
    figma.notify(`${getInstances.length} "${nodeType}s" selected`);
  }

  if (msg.type === "get-instances-by-size") {
    const nodeWidth = referenceNode.width;
    const nodeHeight = referenceNode.height;
    const getInstances = figma.currentPage.findAll((node) => node.width === nodeWidth && node.height === nodeHeight);
    figma.currentPage.selection = getInstances;
    figma.notify(`${getInstances.length} nodes selected`);
  }

  if (msg.type === "get-instances-by-width") {
    const nodeWidth = referenceNode.width;
    const getInstances = figma.currentPage.findAll((node) => node.width === nodeWidth);
    figma.currentPage.selection = getInstances;
    figma.notify(`${getInstances.length} nodes selected`);
  }

  if (msg.type === "get-instances-by-height") {
    const nodeHeight = referenceNode.height;
    const getInstances = figma.currentPage.findAll((node) => node.height === nodeHeight);
    figma.currentPage.selection = getInstances;
    figma.notify(`${getInstances.length} nodes selected`);
  }

  if (msg.type === "get-instances-by-radius") {
    if (!referenceNode || !("cornerRadius" in referenceNode)) return;

    const nodeRadius = referenceNode.cornerRadius;
    const nodeTopLeftRadius = "topLeftRadius" in referenceNode ? referenceNode.topLeftRadius : undefined;
    const nodeTopRightRadius = "topRightRadius" in referenceNode ? referenceNode.topRightRadius : undefined;
    const nodeBottomRightRadius = "bottomRightRadius" in referenceNode ? referenceNode.bottomRightRadius : undefined;
    const nodeBottomLeftRadius = "bottomLeftRadius" in referenceNode ? referenceNode.bottomLeftRadius : undefined;

    const getInstances = figma.currentPage.findAll((node) => {
      if (["FRAME", "COMPONENT", "INSTANCE", "GROUP", "VECTOR", "LINE", "STAR", "ELLIPSE", "RECTANGLE", "POLYGON"].includes(node.type)) {
        if ("cornerRadius" in node) {
          // If using a single radius value
          if (nodeRadius !== undefined && nodeRadius !== figma.mixed) {
            return node.cornerRadius === nodeRadius;
          }

          // If using individual corner radii
          if ("topLeftRadius" in node && "topRightRadius" in node && "bottomRightRadius" in node && "bottomLeftRadius" in node) {
            return node.topLeftRadius === nodeTopLeftRadius && node.topRightRadius === nodeTopRightRadius && node.bottomRightRadius === nodeBottomRightRadius && node.bottomLeftRadius === nodeBottomLeftRadius;
          }
        }
      }
      return false;
    });

    figma.currentPage.selection = getInstances;
    figma.notify(`${getInstances.length} nodes with matching corner radius selected`);
  }

  if (msg.type === "get-instances-by-fills") {
    if (selection.length === 1) {
      const node = selection[0];
      if (!("fills" in node)) return;

      const fills = node.fills;
      if (fills === figma.mixed || !Array.isArray(fills) || fills.length === 0) return;

      const selectionFill = fills[0];
      const getInstances = figma.currentPage.findAll((node) => {
        if ("fills" in node) {
          const nodeFills = node.fills;
          if (nodeFills === figma.mixed || !Array.isArray(nodeFills) || nodeFills.length === 0) return false;

          const nodeFill = nodeFills[0];
          if (!nodeFill || nodeFill.type !== selectionFill.type) return false;

          // Match basic properties for all fill types
          const basicMatch = nodeFill.visible === selectionFill.visible && nodeFill.opacity === selectionFill.opacity && nodeFill.blendMode === selectionFill.blendMode;

          if (!basicMatch) return false;

          // Match specific properties based on fill type
          switch (selectionFill.type) {
            case "SOLID":
              return "color" in nodeFill && "color" in selectionFill && nodeFill.color.r === selectionFill.color.r && nodeFill.color.g === selectionFill.color.g && nodeFill.color.b === selectionFill.color.b;

            case "IMAGE":
              return "imageHash" in nodeFill && "imageHash" in selectionFill && nodeFill.imageHash === selectionFill.imageHash && nodeFill.scaleMode === selectionFill.scaleMode;

            case "GRADIENT_LINEAR":
            case "GRADIENT_RADIAL":
            case "GRADIENT_ANGULAR":
            case "GRADIENT_DIAMOND":
              return "gradientStops" in nodeFill && "gradientStops" in selectionFill && JSON.stringify(nodeFill.gradientStops) === JSON.stringify(selectionFill.gradientStops) && JSON.stringify(nodeFill.gradientTransform) === JSON.stringify(selectionFill.gradientTransform);

            default:
              return false;
          }
        }
        return false;
      });

      if (getInstances.length > 0) {
        figma.currentPage.selection = getInstances;
        const fillType = selectionFill.type.toLowerCase().replace(/_/g, " ");
        figma.notify(`${getInstances.length} ${fillType} fills selected`);
      } else {
        figma.notify("No matching fills");
      }
    }
  }

  if (msg.type === "get-instances-by-fillVisibility") {
    if (selection.length === 1) {
      const node = selection[0];
      if (!("fills" in node)) return;

      const fills = node.fills;
      if (fills === figma.mixed || !Array.isArray(fills) || fills.length === 0) return;

      const { visible } = fills[0];
      const getInstances = figma.currentPage.findAll((node) => {
        if ("fills" in node) {
          const nodeFills = node.fills;
          if (nodeFills === figma.mixed || !Array.isArray(nodeFills) || nodeFills.length === 0) return false;
          return nodeFills[0].visible === visible;
        }
        return false;
      });
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} ${visible ? "visible" : "hidden"} fill nodes selected`);
    }
  }

  if (msg.type === "get-instances-by-fillOpacity") {
    if (selection.length === 1) {
      const node = selection[0];
      if (!("fills" in node)) return;

      const fills = node.fills;
      if (fills === figma.mixed || !Array.isArray(fills) || fills.length === 0) return;

      const fill = fills[0];
      if (!fill || typeof fill.opacity !== "number") return;

      const opacity = fill.opacity as number;
      const getInstances = figma.currentPage.findAll((node) => {
        if ("fills" in node) {
          const nodeFills = node.fills;
          if (nodeFills === figma.mixed || !Array.isArray(nodeFills) || nodeFills.length === 0) return false;
          const nodeFill = nodeFills[0];
          return nodeFill && typeof nodeFill.opacity === "number" && nodeFill.opacity === opacity;
        }
        return false;
      });
      figma.currentPage.selection = getInstances;
      const opacityPercentage = Math.round(opacity * 100);
      figma.notify(`${getInstances.length} ${opacityPercentage}% fill nodes selected`);
    }
  }

  if (msg.type === "get-instances-by-fillBlendMode") {
    if (selection.length === 1) {
      const node = selection[0];
      if (!("fills" in node)) return;

      const fills = node.fills;
      if (fills === figma.mixed || !Array.isArray(fills) || fills.length === 0) return;

      const fill = fills[0];
      if (!fill || !fill.blendMode) return;

      const blendMode = fill.blendMode;
      const blendModeDisplay = blendMode.toString().replace(/_/g, " ");

      const getInstances = figma.currentPage.findAll((node) => {
        if ("fills" in node) {
          const nodeFills = node.fills;
          if (nodeFills === figma.mixed || !Array.isArray(nodeFills) || nodeFills.length === 0) return false;
          const nodeFill = nodeFills[0];
          return nodeFill && nodeFill.blendMode === blendMode;
        }
        return false;
      });
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} ${blendModeDisplay} fill nodes selected`);
    }
  }

  if (msg.type === "get-instances-by-strokes") {
    if (selection.length === 1) {
      const node = selection[0];
      if (!("strokes" in node)) return;

      const selectionStrokes = node.strokes;
      const getInstances = figma.currentPage.findAll((node) => {
        if ("strokes" in node) {
          const nodeStrokes = node.strokes;
          return nodeStrokes.length > 0 && "color" in nodeStrokes[0] && "color" in selectionStrokes[0] && nodeStrokes[0].color.r === selectionStrokes[0].color.r && nodeStrokes[0].color.g === selectionStrokes[0].color.g && nodeStrokes[0].color.b === selectionStrokes[0].color.b;
        }
        return false;
      });
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} nodes selected`);
    }
  }

  if (msg.type === "get-instances-by-strokeType") {
    if (selection.length === 1) {
      const node = selection[0];
      if (!("strokes" in node)) return;

      const strokes = node.strokes;
      if (!Array.isArray(strokes) || strokes.length === 0) return;

      const selectionStroke = strokes[0];
      const getInstances = figma.currentPage.findAll((node) => {
        if (!("strokes" in node)) return false;
        const nodeStrokes = node.strokes;
        if (!Array.isArray(nodeStrokes) || nodeStrokes.length === 0) return false;

        const stroke = nodeStrokes[0];
        if (!stroke || stroke.type !== selectionStroke.type) return false;

        // Match basic properties for all stroke types
        const basicMatch = stroke.visible === selectionStroke.visible && stroke.opacity === selectionStroke.opacity && stroke.blendMode === selectionStroke.blendMode;

        if (!basicMatch) return false;

        // Match specific properties based on stroke type
        switch (selectionStroke.type) {
          case "SOLID":
            return stroke.color.r === selectionStroke.color.r && stroke.color.g === selectionStroke.color.g && stroke.color.b === selectionStroke.color.b;

          case "IMAGE":
            return stroke.imageHash === selectionStroke.imageHash && stroke.scaleMode === selectionStroke.scaleMode;

          case "GRADIENT_LINEAR":
          case "GRADIENT_RADIAL":
          case "GRADIENT_ANGULAR":
          case "GRADIENT_DIAMOND":
            return JSON.stringify(stroke.gradientStops) === JSON.stringify(selectionStroke.gradientStops) && JSON.stringify(stroke.gradientTransform) === JSON.stringify(selectionStroke.gradientTransform);

          default:
            return false;
        }
      });

      if (getInstances.length > 0) {
        figma.currentPage.selection = getInstances;
        const strokeType = selectionStroke.type.toLowerCase().replace(/_/g, " ");
        figma.notify(`${getInstances.length} ${strokeType} stroke nodes selected`);
      } else {
        figma.notify("No matching strokes");
      }
    }
  }

  if (msg.type === "get-instances-by-strokeVisibility") {
    if (selection.length === 1) {
      const node = selection[0];
      if (!("strokes" in node)) return;

      const selectionStroke = node.strokes[0];
      const { visible } = selectionStroke;
      const getInstances = figma.currentPage.findAll((node) => {
        return "strokes" in node && node.strokes[0]?.visible === visible;
      });
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} ${visible ? "visible" : "hidden"} stroke nodes selected`);
    }
  }

  if (msg.type === "get-instances-by-strokeOpacity") {
    if (selection.length === 1) {
      const node = selection[0];
      if (!("strokes" in node)) return;

      const selectionStroke = node.strokes[0];
      if (!selectionStroke || typeof selectionStroke.opacity !== "number") return;

      const opacity = selectionStroke.opacity;
      const getInstances = figma.currentPage.findAll((node) => {
        return "strokes" in node && node.strokes[0]?.opacity === opacity;
      });
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} ${Math.round(opacity * 100)}% stroke nodes selected`);
    }
  }

  if (msg.type === "get-instances-by-strokeBlendMode") {
    if (selection.length === 1) {
      const node = selection[0];
      if (!("strokes" in node)) return;

      const selectionStroke = node.strokes[0];
      const { blendMode } = selectionStroke;
      const getInstances = figma.currentPage.findAll((node) => {
        return "strokes" in node && node.strokes[0]?.blendMode === blendMode;
      });
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} ${String(blendMode).replace(/_/g, " ")} stroke nodes selected`);
    }
  }

  if (msg.type === "get-instances-by-strokeWeight") {
    const node = selection[0];
    if (!("strokeWeight" in node)) return;

    const nodeStrokeWeight = node.strokeWeight;
    const getInstances = figma.currentPage.findAll((node) => {
      return "strokeWeight" in node && node.strokeWeight === nodeStrokeWeight;
    });
    figma.currentPage.selection = getInstances;
    figma.notify(`${getInstances.length} nodes selected`);
  }

  if (msg.type === "get-instances-by-textSize") {
    const node = selection[0];
    if (node?.type !== "TEXT") return;

    const nodeTextSize = node.fontSize;
    const getInstances = figma.currentPage.findAll((node) => {
      return node.type === "TEXT" && node.fontSize === nodeTextSize;
    });
    figma.currentPage.selection = getInstances;
    figma.notify(`${getInstances.length} nodes selected`);
  }

  if (msg.type === "get-instances-by-fontName") {
    if (selection.length === 0) {
      figma.notify("You need to select some text to continue");
    } else if (selection.length === 1) {
      const node = selection[0];
      if (node?.type !== "TEXT") return;

      const fontName = node.fontName;
      if (fontName === figma.mixed) return;

      const getInstances = figma.currentPage.findAll((node) => {
        return node.type === "TEXT" && node.fontName !== figma.mixed && node.fontName === fontName;
      });
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} ${fontName.family} (${fontName.style}) selected`);
    }
  }

  if (msg.type === "get-instances-by-fontFamily") {
    if (selection.length === 0) {
      figma.notify("You need to select some text to continue");
    } else if (selection.length === 1) {
      const node = selection[0];
      if (node?.type !== "TEXT") return;

      const fontName = node.fontName;
      if (fontName === figma.mixed) return;

      const getInstances = figma.currentPage.findAll((node) => {
        return node.type === "TEXT" && node.fontName !== figma.mixed && node.fontName.family === fontName.family;
      });
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} ${fontName.family} selected`);
    }
  }

  if (msg.type === "get-instances-by-fontStyle") {
    if (selection.length === 0) {
      figma.notify("You need to select some text to continue");
    } else if (selection.length === 1) {
      const node = selection[0];
      if (node?.type !== "TEXT") return;

      const fontName = node.fontName;
      if (fontName === figma.mixed) return;

      const getInstances = figma.currentPage.findAll((node) => {
        return node.type === "TEXT" && node.fontName !== figma.mixed && node.fontName.style === fontName.style;
      });
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} ${fontName.style} selected`);
    }
  }

  if (msg.type === "get-instances-by-characters") {
    if (selection.length === 0) {
      figma.notify("You need to select some text to continue");
    } else {
      const selectedText = selection[0] as TextNode;
      const getInstances = figma.currentPage.findAll((node) => node.type === "TEXT" && node.characters === selectedText.characters && node.characters.length === selectedText.characters.length);
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} nodes selected`);
    }
  }

  if (msg.type === "get-instances-by-effects") {
    if (selection.length === 1) {
      const node = selection[0];
      if (!("effects" in node)) return;

      const effects = node.effects;
      if (!Array.isArray(effects) || effects.length === 0) return;

      const selectedEffect = effects[0];
      const getInstances = figma.currentPage.findAll((node) => {
        if (!("effects" in node)) return false;
        const nodeEffects = node.effects;
        if (!Array.isArray(nodeEffects) || nodeEffects.length === 0) return false;

        const effect = nodeEffects[0];
        if (!effect || effect.type !== selectedEffect.type) return false;

        // Match basic properties for all effect types
        const basicMatch = effect.visible === selectedEffect.visible && effect.blendMode === selectedEffect.blendMode;

        if (!basicMatch) return false;

        // Match specific properties based on effect type
        switch (selectedEffect.type) {
          case "DROP_SHADOW":
          case "INNER_SHADOW":
            return effect.color.r === selectedEffect.color.r && effect.color.g === selectedEffect.color.g && effect.color.b === selectedEffect.color.b && effect.offset.x === selectedEffect.offset.x && effect.offset.y === selectedEffect.offset.y && effect.radius === selectedEffect.radius && effect.spread === selectedEffect.spread;

          case "LAYER_BLUR":
          case "BACKGROUND_BLUR":
            return effect.radius === selectedEffect.radius;

          default:
            return false;
        }
      });

      if (getInstances.length > 0) {
        figma.currentPage.selection = getInstances;
        const effectType = selectedEffect.type.toLowerCase().replace(/_/g, " ");
        figma.notify(`${getInstances.length} ${effectType} effects selected`);
      } else {
        figma.notify("No matching effects");
      }
    }
  }

  if (msg.type === "get-instances-by-findBySelect" && msg.pickFromSelect) {
    const fontFamily = msg.pickFromSelect;
    const getInstances = figma.currentPage.findAll((node) => {
      return node.type === "TEXT" && node.fontName !== figma.mixed && node.fontName.family === fontFamily;
    });
    figma.currentPage.selection = getInstances;
    figma.notify(`${getInstances.length} ${fontFamily} selected`);
  }

  if (msg.type === "get-instances-by-layoutMode") {
    if (selection.length === 1) {
      const node = selection[0];
      if (!("layoutMode" in node)) return;

      const layoutMode = node.layoutMode;
      const getInstances = figma.currentPage.findAll((node) => {
        return "layoutMode" in node && node.layoutMode === layoutMode;
      });
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} ${layoutMode.toLowerCase()} layout nodes selected`);
    }
  }

  if (msg.type === "get-instances-by-layoutSpacing") {
    if (selection.length === 1) {
      const node = selection[0];
      if (!("layoutMode" in node) || !("itemSpacing" in node)) return;

      const spacing = node.itemSpacing;
      const getInstances = figma.currentPage.findAll((node) => {
        return "layoutMode" in node && "itemSpacing" in node && node.itemSpacing === spacing;
      });
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} nodes with ${spacing}px spacing selected`);
    }
  }

  if (msg.type === "get-instances-by-layoutPadding") {
    if (selection.length === 1) {
      const node = selection[0];
      if (!("layoutMode" in node) || !("paddingTop" in node)) return;

      const { paddingTop, paddingRight, paddingBottom, paddingLeft } = node;
      const getInstances = figma.currentPage.findAll((node) => {
        return "layoutMode" in node && "paddingTop" in node && node.paddingTop === paddingTop && node.paddingRight === paddingRight && node.paddingBottom === paddingBottom && node.paddingLeft === paddingLeft;
      });
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} nodes with matching padding selected`);
    }
  }

  if (msg.type === "get-instances-by-layoutAlignment") {
    if (selection.length === 1) {
      const node = selection[0];
      if (!("layoutMode" in node) || !("primaryAxisAlignItems" in node)) return;

      const { primaryAxisAlignItems, counterAxisAlignItems } = node;
      const getInstances = figma.currentPage.findAll((node) => {
        return "layoutMode" in node && "primaryAxisAlignItems" in node && node.primaryAxisAlignItems === primaryAxisAlignItems && node.counterAxisAlignItems === counterAxisAlignItems;
      });
      figma.currentPage.selection = getInstances;
      const primaryAlign = String(primaryAxisAlignItems).toLowerCase().replace(/_/g, " ");
      const counterAlign = String(counterAxisAlignItems).toLowerCase().replace(/_/g, " ");
      figma.notify(`${getInstances.length} nodes with ${primaryAlign}/${counterAlign} alignment selected`);
    }
  }

  if (msg.type === "get-instances-by-layoutGrow") {
    if (selection.length === 1) {
      const node = selection[0];
      if (!("layoutGrow" in node)) return;

      const layoutGrow = node.layoutGrow;
      const getInstances = figma.currentPage.findAll((node) => {
        return "layoutGrow" in node && node.layoutGrow === layoutGrow;
      });
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} nodes with layout grow ${layoutGrow} selected`);
    }
  }

  if (msg.type === "get-instances-by-letterSpacing") {
    if (selection.length === 1) {
      const node = selection[0];
      if (node?.type !== "TEXT") return;

      const letterSpacing = node.letterSpacing;
      if (letterSpacing === figma.mixed) return;

      const getInstances = figma.currentPage.findAll((node) => {
        return node.type === "TEXT" && node.letterSpacing !== figma.mixed && node.letterSpacing === letterSpacing;
      });
      figma.currentPage.selection = getInstances;

      // Format the spacing value based on its unit type
      let spacingDisplay = "";
      if ("unit" in letterSpacing) {
        if (letterSpacing.unit === "PERCENT") {
          spacingDisplay = `${letterSpacing.value}%`;
        } else if (letterSpacing.unit === "PIXELS") {
          spacingDisplay = `${letterSpacing.value}px`;
        }
      }
      figma.notify(`${getInstances.length} nodes with ${spacingDisplay} letter spacing selected`);
    }
  }

  if (msg.type === "get-instances-by-lineHeight") {
    if (selection.length === 1) {
      const node = selection[0];
      if (node?.type !== "TEXT") return;

      const lineHeight = node.lineHeight;
      if (lineHeight === figma.mixed) return;

      const getInstances = figma.currentPage.findAll((node) => {
        return node.type === "TEXT" && node.lineHeight !== figma.mixed && node.lineHeight === lineHeight;
      });
      figma.currentPage.selection = getInstances;

      // Format the line height value based on its unit type
      let heightDisplay = "";
      if ("unit" in lineHeight) {
        if (lineHeight.unit === "AUTO") {
          heightDisplay = "auto";
        } else if (lineHeight.unit === "PERCENT") {
          heightDisplay = `${lineHeight.value}%`;
        } else if (lineHeight.unit === "PIXELS") {
          heightDisplay = `${lineHeight.value}px`;
        }
      }
      figma.notify(`${getInstances.length} nodes with ${heightDisplay} line height selected`);
    }
  }

  if (msg.type === "get-instances-by-textCase") {
    if (selection.length === 1) {
      const node = selection[0];
      if (node?.type !== "TEXT") return;

      const textCase = node.textCase;
      if (textCase === figma.mixed) return;

      const getInstances = figma.currentPage.findAll((node) => {
        return node.type === "TEXT" && node.textCase !== figma.mixed && node.textCase === textCase;
      });
      figma.currentPage.selection = getInstances;
      const textCaseDisplay = String(textCase).toLowerCase().replace(/_/g, " ");
      figma.notify(`${getInstances.length} ${textCaseDisplay} case nodes selected`);
    }
  }

  if (msg.type === "get-instances-by-textDecoration") {
    if (selection.length === 1) {
      const node = selection[0];
      if (node?.type !== "TEXT") return;

      const textDecoration = node.textDecoration;
      if (textDecoration === figma.mixed) return;

      const getInstances = figma.currentPage.findAll((node) => {
        return node.type === "TEXT" && node.textDecoration !== figma.mixed && node.textDecoration === textDecoration;
      });
      figma.currentPage.selection = getInstances;
      const decorationDisplay = String(textDecoration).toLowerCase().replace(/_/g, " ");
      figma.notify(`${getInstances.length} ${decorationDisplay} nodes selected`);
    }
  }

  if (msg.type === "get-instances-by-componentSet") {
    if (selection.length === 1) {
      const node = selection[0];
      if (!("componentSetId" in node)) return;

      const componentSetId = node.componentSetId;
      const getInstances = figma.currentPage.findAll((node) => {
        return "componentSetId" in node && node.componentSetId === componentSetId;
      });
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} instances from the same component set selected`);
    }
  }

  if (msg.type === "get-instances-by-componentProperties") {
    if (selection.length === 1) {
      const node = selection[0];
      if (!("componentProperties" in node)) return;

      const componentProperties = node.componentProperties;
      const getInstances = figma.currentPage.findAll((node) => {
        if (!("componentProperties" in node)) return false;
        const nodeProps = node.componentProperties;

        // Compare each property
        for (const [key, value] of Object.entries(componentProperties)) {
          if (!(key in nodeProps) || nodeProps[key].value !== value.value) {
            return false;
          }
        }
        return true;
      });
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} instances with matching properties selected`);
    }
  }

  if (msg.type === "get-instances-by-variantProperties") {
    if (selection.length === 1) {
      const node = selection[0];
      if (!("variantProperties" in node)) return;

      const variantProperties = node.variantProperties;
      if (!variantProperties) return;

      const getInstances = figma.currentPage.findAll((node) => {
        if (!("variantProperties" in node)) return false;
        const nodeVariants = node.variantProperties;
        if (!nodeVariants) return false;

        // Compare each variant property
        return Object.entries(variantProperties).every(([key, value]) => nodeVariants[key] === value);
      });
      figma.currentPage.selection = getInstances;

      // Create a readable string of variant properties
      const variantString = Object.entries(variantProperties)
        .map(([key, value]) => `${key}=${value}`)
        .join(", ");
      figma.notify(`${getInstances.length} instances with variants (${variantString}) selected`);
    }
  }

  if (msg.type === "get-instances-by-exportSettings") {
    if (selection.length === 1) {
      const node = selection[0];
      if (!("exportSettings" in node)) return;

      const exportSettings = node.exportSettings;
      if (!exportSettings || exportSettings.length === 0) return;

      const getInstances = figma.currentPage.findAll((node) => {
        if (!("exportSettings" in node)) return false;
        const nodeExports = node.exportSettings;
        if (!nodeExports || nodeExports.length !== exportSettings.length) return false;

        // Compare each export setting
        return exportSettings.every((setting, index) => {
          const nodeExport = nodeExports[index];
          return nodeExport && nodeExport.format === setting.format && nodeExport.suffix === setting.suffix;
        });
      });
      figma.currentPage.selection = getInstances;

      // Create a readable string of export settings
      const exportString = exportSettings.map((setting) => `${setting.format.toLowerCase()}${setting.suffix ? `@${setting.suffix}` : ""}`).join(", ");
      figma.notify(`${getInstances.length} instances with export settings (${exportString}) selected`);
    }
  }

  if (msg.type === "get-instances-by-exportFormat") {
    if (selection.length === 1) {
      const node = selection[0];
      if (!("exportSettings" in node)) return;

      const exportSettings = node.exportSettings;
      if (!exportSettings || exportSettings.length === 0) return;

      // Get the format of the first export setting
      const format = exportSettings[0].format;

      const getInstances = figma.currentPage.findAll((node) => {
        if (!("exportSettings" in node)) return false;
        const nodeExports = node.exportSettings;
        return nodeExports && nodeExports.length > 0 && nodeExports[0].format === format;
      });
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} instances with ${format.toLowerCase()} export format selected`);
    }
  }

  if (msg.type === "combine-searches" && Array.isArray(msg.searches)) {
    if (selection.length === 0) {
      figma.notify("Please select at least one node");
      return;
    }

    console.log(
      "Initial selection:",
      selection.map((n) => ({ id: n.id, name: n.name, type: n.type }))
    );
    console.log("Search types:", msg.searches);
    console.log("Reference node:", referenceNode ? { id: referenceNode.id, name: referenceNode.name, type: referenceNode.type } : "none");

    // Start with all nodes if only one node is selected, otherwise filter the current selection
    let results = selection.length === 1 ? figma.currentPage.findAll(() => true) : selection;
    console.log("Starting with nodes:", results.length);

    // For saved searches or when no specific search types are provided,
    // find all nodes that match the reference node's basic properties
    if (msg.searches.length === 0) {
      results = results.filter((n) => {
        // Match type
        if (n.type !== referenceNode.type) return false;

        // Match size if applicable
        if ("width" in referenceNode && "height" in referenceNode && "width" in n && "height" in n) {
          if (n.width !== referenceNode.width || n.height !== referenceNode.height) return false;
        }

        // Match fills if applicable
        if ("fills" in referenceNode && "fills" in n) {
          const refFills = referenceNode.fills;
          const nodeFills = n.fills;
          // Skip if either fill is mixed or not an array
          if (!Array.isArray(refFills) || !Array.isArray(nodeFills)) return false;
          if (refFills.length === 0 || nodeFills.length === 0) return false;

          const refFill = refFills[0];
          const nodeFill = nodeFills[0];
          if (!nodeFill || nodeFill.type !== refFill.type) return false;

          if (refFill.type === "SOLID" && nodeFill.type === "SOLID") {
            const refOpacity = refFill.opacity ?? 1;
            const nodeOpacity = nodeFill.opacity ?? 1;
            return Math.abs(nodeFill.color.r - refFill.color.r) < 0.01 && Math.abs(nodeFill.color.g - refFill.color.g) < 0.01 && Math.abs(nodeFill.color.b - refFill.color.b) < 0.01 && Math.abs(nodeOpacity - refOpacity) < 0.01;
          }
        }

        // Match strokes if applicable
        if ("strokes" in referenceNode && "strokes" in n) {
          const refStrokes = referenceNode.strokes;
          const nodeStrokes = n.strokes;
          // Skip if either stroke is mixed or not an array
          if (!Array.isArray(refStrokes) || !Array.isArray(nodeStrokes)) return false;
          if (refStrokes.length === 0 || nodeStrokes.length === 0) return false;

          const refStroke = refStrokes[0];
          const nodeStroke = nodeStrokes[0];
          if (!nodeStroke || nodeStroke.type !== refStroke.type) return false;

          if (refStroke.type === "SOLID" && nodeStroke.type === "SOLID") {
            return Math.abs(nodeStroke.color.r - refStroke.color.r) < 0.01 && Math.abs(nodeStroke.color.g - refStroke.color.g) < 0.01 && Math.abs(nodeStroke.color.b - refStroke.color.b) < 0.01;
          }
        }

        return true;
      });

      console.log("Found similar nodes:", results.length);
      figma.currentPage.selection = results;
      figma.notify(`${results.length} similar nodes selected`);
      return;
    }

    // Filter results based on each search type
    for (const searchType of msg.searches) {
      console.log("\nProcessing search type:", searchType);
      const beforeCount = results.length;

      switch (searchType) {
        case "get-instances-by-name":
          results = results.filter((n) => n.name === referenceNode.name);
          break;

        case "get-instances-by-type":
          results = results.filter((n) => n.type === referenceNode.type);
          break;

        case "get-instances-by-size":
          if ("width" in referenceNode && "height" in referenceNode) {
            results = results.filter((n) => "width" in n && "height" in n && n.width === referenceNode.width && n.height === referenceNode.height);
          }
          break;

        case "get-instances-by-fills":
          if ("fills" in referenceNode) {
            const fills = referenceNode.fills;
            // Handle mixed fills
            if (typeof fills === "symbol") return;
            // Now we know it's an array
            const fillsArray = fills as Paint[];
            if (fillsArray.length > 0) {
              const selectionFill = fillsArray[0];
              console.log("Reference fill:", {
                type: selectionFill.type,
                color: "color" in selectionFill ? selectionFill.color : null,
              });

              results = results.filter((n) => {
                if (!("fills" in n)) return false;
                const nodeFills = n.fills;
                // Handle mixed fills
                if (typeof nodeFills === "symbol") return false;
                // Now we know it's an array
                const nodeFillsArray = nodeFills as Paint[];
                if (nodeFillsArray.length === 0) return false;

                const nodeFill = nodeFillsArray[0];
                if (!nodeFill || nodeFill.type !== selectionFill.type) return false;

                switch (selectionFill.type) {
                  case "SOLID":
                    if (nodeFill.type === "SOLID") {
                      const selectionOpacity = selectionFill.opacity ?? 1;
                      const nodeOpacity = nodeFill.opacity ?? 1;
                      return Math.abs(nodeFill.color.r - selectionFill.color.r) < 0.01 && Math.abs(nodeFill.color.g - selectionFill.color.g) < 0.01 && Math.abs(nodeFill.color.b - selectionFill.color.b) < 0.01 && Math.abs(nodeOpacity - selectionOpacity) < 0.01;
                    }
                    break;
                  case "IMAGE":
                    if (nodeFill.type === "IMAGE") {
                      return nodeFill.imageHash === selectionFill.imageHash && nodeFill.scaleMode === selectionFill.scaleMode;
                    }
                    break;
                  case "GRADIENT_LINEAR":
                  case "GRADIENT_RADIAL":
                  case "GRADIENT_ANGULAR":
                  case "GRADIENT_DIAMOND":
                    if (nodeFill.type === selectionFill.type) {
                      return JSON.stringify(nodeFill.gradientStops) === JSON.stringify(selectionFill.gradientStops) && JSON.stringify(nodeFill.gradientTransform) === JSON.stringify(selectionFill.gradientTransform);
                    }
                    break;
                }
                return false;
              });
            }
          }
          break;

        case "get-instances-by-strokes":
          if ("strokes" in referenceNode) {
            const strokes = referenceNode.strokes;
            if (Array.isArray(strokes) && strokes.length > 0) {
              const selectionStroke = strokes[0];
              results = results.filter((n) => {
                if (!("strokes" in n)) return false;
                const nodeStrokes = n.strokes;
                if (!Array.isArray(nodeStrokes) || nodeStrokes.length === 0) return false;
                const nodeStroke = nodeStrokes[0];
                if (!nodeStroke || nodeStroke.type !== selectionStroke.type) return false;

                switch (selectionStroke.type) {
                  case "SOLID":
                    return Math.abs(nodeStroke.color.r - selectionStroke.color.r) < 0.01 && Math.abs(nodeStroke.color.g - selectionStroke.color.g) < 0.01 && Math.abs(nodeStroke.color.b - selectionStroke.color.b) < 0.01;
                  case "GRADIENT_LINEAR":
                  case "GRADIENT_RADIAL":
                  case "GRADIENT_ANGULAR":
                  case "GRADIENT_DIAMOND":
                    return JSON.stringify(nodeStroke.gradientStops) === JSON.stringify(selectionStroke.gradientStops) && JSON.stringify(nodeStroke.gradientTransform) === JSON.stringify(selectionStroke.gradientTransform);
                }
                return false;
              });
            }
          }
          break;

        case "get-instances-by-effects":
          if ("effects" in referenceNode) {
            const effects = referenceNode.effects;
            if (Array.isArray(effects) && effects.length > 0) {
              const selectionEffect = effects[0];
              results = results.filter((n) => {
                if (!("effects" in n)) return false;
                const nodeEffects = n.effects;
                if (!Array.isArray(nodeEffects) || nodeEffects.length === 0) return false;
                const nodeEffect = nodeEffects[0];
                if (!nodeEffect || nodeEffect.type !== selectionEffect.type) return false;

                switch (selectionEffect.type) {
                  case "DROP_SHADOW":
                  case "INNER_SHADOW":
                    return nodeEffect.color.r === selectionEffect.color.r && nodeEffect.color.g === selectionEffect.color.g && nodeEffect.color.b === selectionEffect.color.b && nodeEffect.offset.x === selectionEffect.offset.x && nodeEffect.offset.y === selectionEffect.offset.y && nodeEffect.radius === selectionEffect.radius && nodeEffect.spread === selectionEffect.spread;
                  case "LAYER_BLUR":
                  case "BACKGROUND_BLUR":
                    return nodeEffect.radius === selectionEffect.radius;
                }
                return false;
              });
            }
          }
          break;

        case "get-instances-by-radius":
          if ("cornerRadius" in referenceNode) {
            const nodeRadius = referenceNode.cornerRadius;
            if (nodeRadius !== figma.mixed) {
              results = results.filter((n) => {
                if (!("cornerRadius" in n)) return false;
                return n.cornerRadius === nodeRadius;
              });
            } else if ("topLeftRadius" in referenceNode) {
              // Handle individual corner radii
              const { topLeftRadius, topRightRadius, bottomRightRadius, bottomLeftRadius } = referenceNode;
              results = results.filter((n) => {
                if (!("topLeftRadius" in n)) return false;
                return n.topLeftRadius === topLeftRadius && n.topRightRadius === topRightRadius && n.bottomRightRadius === bottomRightRadius && n.bottomLeftRadius === bottomLeftRadius;
              });
            }
          }
          break;
      }

      console.log(`After ${searchType}: ${results.length} nodes (removed ${beforeCount - results.length})`);
    }

    // Update selection with final results
    console.log(
      "\nFinal results:",
      results.map((n) => ({ id: n.id, name: n.name, type: n.type }))
    );
    figma.currentPage.selection = results;
    figma.notify(`${results.length} nodes match all criteria`);
  }
};
