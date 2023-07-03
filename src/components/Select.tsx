import React from 'react';
import * as Select from '@radix-ui/react-select';
import * as Label from '@radix-ui/react-label';
import { CheckIcon, ChevronDownIcon } from '@radix-ui/react-icons';

interface SelectInputProps {
  onChange: (value: string) => void;
  fontNames: string[];
}

function SelectInput({ onChange, fontNames }: SelectInputProps) {
  const [selectedFontName, setSelectedFontName] = React.useState<string>('');

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedFontName(value);
    onChange(value);
  };

  const filteredFontNames = fontNames.filter((fontName: string) => fontName.toLowerCase().includes(selectedFontName.toLowerCase()));

  return (
    <div className='flex w-full flex-wrap items-center gap-2'>
      <Label.Root className='text-xs font-medium text-figma-primary' htmlFor='export-types'>
        Fonts
      </Label.Root>
      <Select.Root onValueChange={(value) => handleSelectChange({ target: { value } } as React.ChangeEvent<HTMLSelectElement>)}>
        <Select.Trigger className='inline-flex h-8 w-full cursor-default appearance-none items-center justify-between rounded-md bg-figma-secondaryBg px-3 text-xs leading-none text-figma-primary  outline-none focus:outline-blue-700 dark:focus:outline-figma-blue' aria-label='Fonts' id='font-names'>
          <Select.Value placeholder='No fonts selected' defaultValue={selectedFontName} />
          <Select.Icon className='text-figma-icon'>
            <ChevronDownIcon />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className='overflow-hidden rounded-md bg-figma shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] dark:border dark:border-figma-border dark:shadow-none'>
            <Select.ScrollUpButton />
            <Select.Viewport className='p-2'>
              {filteredFontNames.map((font: string) => (
                <Select.Item key={font} value={font} className='relative flex h-6 select-none items-center rounded pl-6 pr-8 text-xs leading-none text-figma-primary'>
                  <Select.ItemText>{font}</Select.ItemText>
                  <Select.ItemIndicator className='absolute left-0 inline-flex w-6 items-center justify-center'>{selectedFontName === font && <CheckIcon />}</Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
            <Select.ScrollDownButton />
            <Select.Arrow />
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

export default SelectInput;
