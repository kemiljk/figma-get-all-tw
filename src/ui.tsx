import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import './ui.css';

function App() {
  const [selectedFontName, setSelectedFontName] = React.useState<string>('');
  const [openSections, setOpenSections] = React.useState<{ [key: string]: boolean }>({});

  window.onmessage = (event) => {
    const fontSelect = document.getElementById('fontSelect') as HTMLSelectElement;
    if (event.data.pluginMessage.fontNames) {
      const fontNames = event.data.pluginMessage.fontNames;
      if (!fontNames) {
        fontSelect.append('No fonts found');
        fontSelect.setAttribute('disabled', 'true');
      }
      fontNames.forEach((font) => {
        const createOption = document.createElement('option');
        createOption.value = font;
        createOption.innerText = font;
        createOption.id = font;
        if (font) {
        }
        fontSelect.append(createOption);
      });
    }
  };

  const selectionOptions = [
    { id: 'name', name: 'Name', type: 'get-instances-by-name' },
    { id: 'type', name: 'Type', type: 'get-instances-by-type' },
    { id: 'size', name: 'Size', type: 'get-instances-by-size' },
    { id: 'radius', name: 'Radius', type: 'get-instances-by-radius' },
  ];

  const sizeOptions = [
    { id: 'width', name: 'Width', type: 'get-instances-by-width' },
    { id: 'height', name: 'Height', type: 'get-instances-by-height' },
  ];

  const colorOptions = [
    { id: 'fills', name: 'Fills', type: 'get-instances-by-fills' },
    { id: 'fill-type', name: 'Fill Type', type: 'get-instances-by-fillType' },
    { id: 'fill-visibility', name: 'Visibility', type: 'get-instances-by-fillVisibility' },
    { id: 'fill-opacity', name: 'Opacity', type: 'get-instances-by-fillOpacity' },
    { id: 'fill-blendMode', name: 'Blend Mode', type: 'get-instances-by-fillBlendMode' },
  ];

  const strokeOptions = [
    { id: 'strokes', name: 'Strokes', type: 'get-instances-by-strokes' },
    { id: 'stroke-type', name: 'Stroke Type', type: 'get-instances-by-strokeType' },
    { id: 'stroke-visibility', name: 'Visibility', type: 'get-instances-by-strokeVisibility' },
    { id: 'stroke-opacity', name: 'Opacity', type: 'get-instances-by-strokeOpacity' },
    { id: 'stroke-blendMode', name: 'Blend Mode', type: 'get-instances-by-strokeBlendMode' },
    { id: 'strokeWeight', name: 'Stroke Weight', type: 'get-instances-by-strokeWeight' },
  ];

  const textOptions = [
    { id: 'textSize', name: 'Text Size', type: 'get-instances-by-textSize' },
    { id: 'characters', name: 'Characters', type: 'get-instances-by-characters' },
    { id: 'fontName', name: 'Font Name', type: 'get-instances-by-fontName' },
    { id: 'fontFamily', name: 'Font Family', type: 'get-instances-by-fontFamily' },
    { id: 'fontStyle', name: 'Font Style', type: 'get-instances-by-fontStyle' },
  ];

  // const effectOptions = [{ id: 'effects', name: 'Effects', type: 'get-instances-by-effects' }];

  const handleOptionClick = (type: string) => {
    parent.postMessage({ pluginMessage: { type } }, '*');
  };

  const handleFontSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFontName(e.target.value);
  };

  const handleButtonClick = () => {
    const fontSelect = document.getElementById('fontSelect') as HTMLSelectElement;
    const value = fontSelect.value;
    console.log(value);
    parent.postMessage({ pluginMessage: { type: 'get-instances-by-findBySelect', pickFromSelect: value } }, '*');
  };

  const toggleSection = (id: string) => {
    setOpenSections((prevOpenSections) => ({
      ...prevOpenSections,
      [id]: !prevOpenSections[id],
    }));
  };

  return (
    <main className='bg-bg-figma flex h-[100vh] w-full flex-col items-center justify-start'>
      <div className='w-full h-full p-2 space-y-4'>
        <div>
          <div className='flex w-full items-center justify-between pb-2' onClick={() => toggleSection('general')}>
            <h3 className='text-xs font-medium text-figma-primary select-none'>General</h3>
            <ChevronDownIcon className='w-4 h-4 text-figma-primary' />
          </div>
          {openSections['general'] && (
            <div className='grid grid-cols-4 gap-2 w-full'>
              {selectionOptions.map(({ id, name, type }) => (
                <button className='w-full cursor-default rounded-md bg-figma-secondaryBg py-3 text-xs font-semibold text-figma-primary hover:bg-figma-secondaryBg-hover select-none' key={id} id={id} onClick={() => handleOptionClick(type)}>
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className='flex w-full items-center justify-between pb-2' onClick={() => toggleSection('size')}>
            <h3 className='text-xs font-medium text-figma-primary select-none'>Size</h3>
            <ChevronDownIcon className='w-4 h-4 text-figma-primary' />
          </div>
          {openSections['size'] && (
            <div className='grid grid-cols-4 gap-2 w-full'>
              {sizeOptions.map(({ id, name, type }) => (
                <button className='w-full cursor-default rounded-md bg-figma-secondaryBg py-3 text-xs font-semibold text-figma-primary hover:bg-figma-secondaryBg-hover select-none' key={id} id={id} onClick={() => handleOptionClick(type)}>
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className='flex w-full items-center justify-between pb-2' onClick={() => toggleSection('colour')}>
            <h3 className='text-xs font-medium text-figma-primary select-none'>Colour</h3>
            <ChevronDownIcon className='w-4 h-4 text-figma-primary' />
          </div>
          {openSections['colour'] && (
            <div className='grid grid-cols-4 gap-2 w-full'>
              {colorOptions.map(({ id, name, type }) => (
                <button className='w-full cursor-default rounded-md bg-figma-secondaryBg py-3 text-xs font-semibold text-figma-primary hover:bg-figma-secondaryBg-hover select-none' key={id} id={id} onClick={() => handleOptionClick(type)}>
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className='flex w-full items-center justify-between pb-2' onClick={() => toggleSection('stroke')}>
            <h3 className='text-xs font-medium text-figma-primary select-none'>Stroke</h3>
            <ChevronDownIcon className='w-4 h-4 text-figma-primary' />
          </div>
          {openSections['stroke'] && (
            <div className='grid grid-cols-4 gap-2 w-full'>
              {strokeOptions.map(({ id, name, type }) => (
                <button className='w-full cursor-default rounded-md bg-figma-secondaryBg py-3 text-xs font-semibold text-figma-primary hover:bg-figma-secondaryBg-hover select-none' key={id} id={id} onClick={() => handleOptionClick(type)}>
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* <div>
          <div className='flex w-full items-center justify-between pb-2' onClick={() => toggleSection('effects')}>
            <h3 className='text-xs font-medium text-figma-primary select-none'>Effects</h3>
            <ChevronDownIcon className='w-4 h-4 text-figma-primary' />
          </div>
          {openSections['effects'] && (
            <div className='grid grid-cols-4 gap-2 w-full'>
              {effectOptions.map(({ id, name, type }) => (
                <button className='w-full cursor-default rounded-md bg-figma-secondaryBg py-3 text-xs font-semibold text-figma-primary hover:bg-figma-secondaryBg-hover select-none' key={id} id={id} onClick={() => handleOptionClick(type)}>
                  {name}
                </button>
              ))}
            </div>
          )}
        </div> */}
        <div>
          <div className='flex w-full items-center justify-between pb-2' onClick={() => toggleSection('text')}>
            <h3 className='text-xs font-medium text-figma-primary select-none'>Text</h3>
            <ChevronDownIcon className='w-4 h-4 text-figma-primary' />
          </div>
          {openSections['text'] && (
            <div className='grid grid-cols-4 gap-2 w-full'>
              {textOptions.map(({ id, name, type }) => (
                <button className='w-full cursor-default rounded-md bg-figma-secondaryBg py-3 text-xs font-semibold text-figma-primary hover:bg-figma-secondaryBg-hover select-none' key={id} id={id} onClick={() => handleOptionClick(type)}>
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
        <select id='fontSelect' className='inline-flex h-8 w-full cursor-default appearance-none items-center justify-between rounded-md bg-figma-secondaryBg px-3 text-xs leading-none text-figma-primary  outline-none focus:outline-blue-700 dark:focus:outline-figma-blue select-none' value={selectedFontName} onChange={handleFontSelect} />
        <button id='findBySelect' className='w-full cursor-default rounded-md bg-figma-secondaryBg py-3 text-xs font-semibold text-figma-primary hover:bg-figma-secondaryBg-hover select-none mb-2' onClick={handleButtonClick}>
          Get all by font
        </button>
      </div>
    </main>
  );
}

const root = createRoot(document.getElementById('react-page')!);
root.render(<App />);
