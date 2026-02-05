'use client';

import { cn } from '@/lib/utils';
import { Image as ImageType } from '@/types';
import { Tab } from '@headlessui/react';
import Image from 'next/image';

interface GalleryTabProps {
    image: ImageType;
    isSelected?: boolean;
}


const GalleryTab: React.FC<GalleryTabProps> = ({ image, isSelected: externalSelected }) => {
  return (
    <Tab className="relative flex aspect-square cursor-pointer items-center justify-center rounded-md bg-white w-[100px] h-[100px]">
        {({selected}) => {
            const isActive = externalSelected !== undefined ? externalSelected : selected;
            return (
                <div>
                    <span className='absolute h-full w-full aspect-square inset-0 overflow-hidden rounded-md'>
                        <Image 
                            fill
                            src={image.url}
                            alt=""
                            className='object-cover object-center'
                        />
                    </span>
                    <span className={cn(
                        "absolute inset-0 rounded-md ring-2 ring-offset-2",
                        isActive ? "ring-black" : "ring-transparent"
                    )}>
                        
                    </span>
                </div>
            );
        }}
    </Tab>
  )
}

export default GalleryTab