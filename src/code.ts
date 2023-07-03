figma.showUI(__html__, { themeColors: true, width: 400, height: 308 });

async function findAllFonts() {
  const nodes = [];

  figma.currentPage.findAll((node) => node.type === 'TEXT').forEach((node: TextNode) => nodes.push(node.fontName !== figma.mixed && node.fontName.family));

  const uniqueFonts = [...new Set(nodes)];
  const selectList = uniqueFonts.filter((val) => val !== false);

  figma.ui.postMessage({ fontNames: selectList });
}
findAllFonts();

figma.ui.onmessage = (msg) => {
  if (msg.type === 'get-instances-by-name') {
    const { selection } = figma.currentPage;
    const nodeName = selection[0]?.name;
    const getInstances = figma.currentPage.findAll().filter((node) => node.name === nodeName);
    figma.currentPage.selection = getInstances;
    figma.notify(`${getInstances.length} "${nodeName}'s" selected`);
  }

  if (msg.type === 'get-instances-by-type') {
    const { selection } = figma.currentPage;
    const nodeType = selection[0]?.type;
    const getInstances = figma.currentPage.findAll().filter((node) => node.type === nodeType);
    figma.currentPage.selection = getInstances;
    figma.notify(`${getInstances.length} "${nodeType}'s" selected`);
  }

  if (msg.type === 'get-instances-by-size') {
    const { selection } = figma.currentPage;
    const nodeWidth = selection[0]?.width;
    const nodeHeight = selection[0]?.height;
    const getInstances = figma.currentPage.findAll().filter((node) => node.width === nodeWidth && node.height === nodeHeight);
    figma.currentPage.selection = getInstances;
    figma.notify(`${getInstances.length} nodes selected`);
  }

  if (msg.type === 'get-instances-by-width') {
    const { selection } = figma.currentPage;
    const nodeWidth = selection[0]?.width;
    const getInstances = figma.currentPage.findAll().filter((node) => node.width === nodeWidth);
    figma.currentPage.selection = getInstances;
    figma.notify(`${getInstances.length} nodes selected`);
  }

  if (msg.type === 'get-instances-by-height') {
    const { selection } = figma.currentPage;
    const nodeHeight = selection[0]?.height;
    const getInstances = figma.currentPage.findAll().filter((node) => node.height === nodeHeight);
    figma.currentPage.selection = getInstances;
    figma.notify(`${getInstances.length} nodes selected`);
  }

  if (msg.type === 'get-instances-by-radius') {
    const { selection } = figma.currentPage;
    const nodeRadius = (selection[0] as any)?.cornerRadius;
    const getInstances = figma.currentPage.findAll().filter((node) => {
      if (['FRAME', 'COMPONENT', 'INSTANCE', 'GROUP', 'VECTOR', 'LINE', 'STAR', 'ELLIPSE', 'RECTANGLE', 'POLYGON'].includes(node.type)) {
        if ('cornerRadius' in node) {
          return node.cornerRadius !== undefined && node.cornerRadius === nodeRadius;
        }
        return false;
      }
      return false;
    });
    figma.currentPage.selection = getInstances;
    figma.notify(`${getInstances.length} nodes selected`);
  }

  if (msg.type === 'get-instances-by-fills') {
    if (figma.currentPage.selection.length === 1) {
      const { selection } = figma.currentPage;
      const selectionFill = (selection[0] as any).fills[0];
      const getInstances = figma.currentPage.findAll().filter((node: any) => {
        if (node.fills.length > 0) {
          const nodeFill = node.fills[0];
          return nodeFill.type === selectionFill.type && nodeFill.visible === selectionFill.visible && nodeFill.opacity === selectionFill.opacity && nodeFill.blendMode === selectionFill.blendMode && nodeFill.color.r === selectionFill.color.r && nodeFill.color.g === selectionFill.color.g && nodeFill.color.b === selectionFill.color.b;
        }
        return false;
      });
      if (getInstances.length > 0) {
        figma.currentPage.selection = getInstances;
        figma.notify(`${getInstances.length} nodes selected`);
      } else {
        figma.notify('No matching fills');
      }
    }
  }

  if (msg.type === 'get-instances-by-fills') {
    if (figma.currentPage.selection.length === 1) {
      const { selection } = figma.currentPage;
      const selectionFill = (selection[0] as any).fills[0];
      const getInstances = figma.currentPage.findAll().filter((node: any) => {
        if (node.fills.length > 0) {
          const nodeFill = node.fills[0];
          return nodeFill.type === selectionFill.type && nodeFill.visible === selectionFill.visible && nodeFill.opacity === selectionFill.opacity && nodeFill.blendMode === selectionFill.blendMode && nodeFill.color.r === selectionFill.color.r && nodeFill.color.g === selectionFill.color.g && nodeFill.color.b === selectionFill.color.b;
        }
        return false;
      });
      if (getInstances.length > 0) {
        figma.currentPage.selection = getInstances;
        figma.notify(`${getInstances.length} nodes selected`);
      } else {
        figma.notify('No matching fills');
      }
    }
  }

  if (msg.type === 'get-instances-by-fillVisibility') {
    if (figma.currentPage.selection.length === 1) {
      const { selection } = figma.currentPage;
      const selectionFill = (selection[0] as any).fills[0];
      const { visible } = selectionFill;
      const getInstances = figma.currentPage.findAll((node: any) => node.fills[0]?.visible === visible);
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} ${visible ? 'visible' : 'hidden'} fill nodes selected`);
    }
  }

  if (msg.type === 'get-instances-by-fillOpacity') {
    if (figma.currentPage.selection.length === 1) {
      const { selection } = figma.currentPage;
      const selectionFill = (selection[0] as any).fills[0];
      const { opacity } = selectionFill;
      const getInstances = figma.currentPage.findAll((node: any) => node.fills[0]?.opacity === opacity);
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} ${Math.round(opacity * 100)}% fill nodes selected`);
    }
  }

  if (msg.type === 'get-instances-by-fillBlendMode') {
    if (figma.currentPage.selection.length === 1) {
      const { selection } = figma.currentPage;
      const selectionFill = (selection[0] as any).fills[0];
      const { blendMode } = selectionFill;
      const getInstances = figma.currentPage.findAll((node: any) => node.fills[0]?.blendMode === blendMode);
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} ${blendMode.replaceAll('_', ' ')} fill nodes selected`);
    }
  }

  if (msg.type === 'get-instances-by-strokes') {
    if (figma.currentPage.selection.length === 1) {
      const { selection } = figma.currentPage;
      const selectionStrokes = (selection[0] as any).strokes;
      const getInstances = figma.currentPage.findAll((node: any) => {
        const nodeStrokes = node.strokes;
        return nodeStrokes.length > 0 && nodeStrokes[0].color && nodeStrokes[0].color.r === selectionStrokes[0].color.r && nodeStrokes[0].color.g === selectionStrokes[0].color.g && nodeStrokes[0].color.b === selectionStrokes[0].color.b;
      });
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} nodes selected`);
    }
  }

  if (msg.type === 'get-instances-by-strokeType') {
    if (figma.currentPage.selection.length === 1) {
      const { selection } = figma.currentPage;
      const selectionStroke = (selection[0] as any).strokes[0];
      const { type } = selectionStroke;
      const getInstances = figma.currentPage.findAll((node: any) => node.strokes[0]?.type === type);
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} ${type} stroke nodes selected`);
    }
  }

  if (msg.type === 'get-instances-by-strokeVisibility') {
    if (figma.currentPage.selection.length === 1) {
      const { selection } = figma.currentPage;
      const selectionStroke = (selection[0] as any).strokes[0];
      const { visible } = selectionStroke;
      const getInstances = figma.currentPage.findAll((node: any) => node.strokes[0]?.visible === visible);
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} ${visible ? 'visible' : 'hidden'} stroke nodes selected`);
    }
  }

  if (msg.type === 'get-instances-by-strokeOpacity') {
    if (figma.currentPage.selection.length === 1) {
      const { selection } = figma.currentPage;
      const selectionStroke = (selection[0] as any).strokes[0];
      const { opacity } = selectionStroke;
      const getInstances = figma.currentPage.findAll((node: any) => node.strokes[0]?.opacity === opacity);
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} ${Math.round(opacity * 100)}% stroke nodes selected`);
    }
  }

  if (msg.type === 'get-instances-by-strokeBlendMode') {
    if (figma.currentPage.selection.length === 1) {
      const { selection } = figma.currentPage;
      const selectionStroke = (selection[0] as any).strokes[0];
      const { blendMode } = selectionStroke;
      const getInstances = figma.currentPage.findAll((node: any) => node.strokes[0]).filter((node: any) => node.strokes[0].blendMode === blendMode);
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} ${blendMode.replaceAll('_', ' ')} stroke nodes selected`);
    }
  }

  if (msg.type === 'get-instances-by-strokeWeight') {
    const { selection } = figma.currentPage;
    const nodeStrokeWeight = (selection[0] as any)?.strokeWeight;
    const getInstances = figma.currentPage.findAll((node: any) => node.type === 'TEXT' && node.strokeWeight === nodeStrokeWeight);
    figma.currentPage.selection = getInstances;
    figma.notify(`${getInstances.length} nodes selected`);
  }

  if (msg.type === 'get-instances-by-textSize') {
    const { selection } = figma.currentPage;
    const nodeTextSize = (selection[0] as TextNode)?.fontSize;
    const getInstances = figma.currentPage.findAll((node) => node.type === 'TEXT' && node.fontSize === nodeTextSize);
    figma.currentPage.selection = getInstances;
    figma.notify(`${getInstances.length} nodes selected`);
  }

  if (msg.type === 'get-instances-by-fontName') {
    if (figma.currentPage.selection.length === 0) {
      figma.notify('You need to select some text to continue');
    } else if (figma.currentPage.selection.length === 1) {
      const selectionFont = (figma.currentPage.selection[0] as any).fontName;
      const getInstances = figma.currentPage.findAll((node: TextNode) => node.type === 'TEXT' && node.fontName === selectionFont);
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} ${selectionFont.family} (${selectionFont.style}) selected`);
    }
  }

  if (msg.type === 'get-instances-by-fontFamily') {
    if (figma.currentPage.selection.length === 0) {
      figma.notify('You need to select some text to continue');
    } else if (figma.currentPage.selection.length === 1) {
      const selectionFont = (figma.currentPage.selection[0] as any).fontName;
      const getInstances = figma.currentPage.findAll((node: any) => node.type === 'TEXT' && node.fontName.family === selectionFont.family);
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} ${selectionFont.family} selected`);
    }
  }

  if (msg.type === 'get-instances-by-fontStyle') {
    if (figma.currentPage.selection.length === 0) {
      figma.notify('You need to select some text to continue');
    } else if (figma.currentPage.selection.length === 1) {
      const selectionFont = (figma.currentPage.selection[0] as any).fontName;
      const getInstances = figma.currentPage.findAll((node: any) => node.type === 'TEXT').filter((node: any) => node.fontName.style === selectionFont.style);
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} ${selectionFont.style} selected`);
    }
  }

  if (msg.type === 'get-instances-by-characters') {
    if (figma.currentPage.selection.length === 0) {
      figma.notify('You need to select some text to continue');
    } else {
      const selectedText = figma.currentPage.selection[0] as TextNode;
      const getInstances = figma.currentPage.findAll((node) => node.type === 'TEXT' && node.characters === selectedText.characters && node.characters.length === selectedText.characters.length);
      figma.currentPage.selection = getInstances;
      figma.notify(`${getInstances.length} nodes selected`);
    }
  }

  if (msg.type === 'get-instances-by-findBySelect') {
    const getInstances = figma.currentPage.findAll((node) => node.type === 'TEXT').filter((node: TextNode) => (node.fontName !== figma.mixed && msg.pickFromSelect !== figma.mixed ? node.fontName.family === msg.pickFromSelect : null));
    figma.currentPage.selection = getInstances;
    figma.notify(`${getInstances.length} ${msg.pickFromSelect !== figma.mixed ? msg.pickFromSelect : null} selected`);
  }

  // if (msg.type === 'get-instances-by-effects') {
  //   const selectedNode = figma.currentPage.selection[0] as any;
  //   const selectedNodeEffects = selectedNode.effects.map(({ type, color, blendMode, offset, spread }) => ({ type, color, blendMode, offset, spread }));
  //   const nodeTypes = ['FRAME', 'COMPONENT', 'INSTANCE', 'GROUP', 'VECTOR', 'LINE', 'STAR', 'ELLIPSE', 'RECTANGLE', 'POLYGON', 'TEXT'];
  //   const getInstances = figma.currentPage.findAll().filter((node: any) => {
  //     if (!nodeTypes.includes(node.type) || node.effects.length !== selectedNodeEffects.length) {
  //       return false;
  //     }
  //     return node.effects.every(({ type, color, blendMode, offset, spread }, i) => {
  //       const selectedEffect = selectedNodeEffects[i];
  //       return type === selectedEffect.type && color === selectedEffect.color && blendMode === selectedEffect.blendMode && offset.x === selectedEffect.offset.x && offset.y === selectedEffect.offset.y && spread === selectedEffect.spread;
  //     });
  //   });
  //   figma.currentPage.selection = getInstances;
  //   figma.notify(`${getInstances.length} nodes selected`);
  // }
};
