'use client';

import { cn } from '@/lib/utils';
import { Image as ImageType } from '@/types';
import { Tab } from '@headlessui/react';
import Image from 'next/image';
import { getOptimizedUrl, getAltText } from '@/lib/cloudinary-utils';

interface GalleryTabProps {
    image: ImageType;
    isSelected?: boolean;
    productName?: string;
}


const GalleryTab: React.FC<GalleryTabProps> = ({ image, isSelected: externalSelected, productName = 'Product thumbnail' }) => {
  return (
    <Tab className="relative flex aspect-square cursor-pointer items-center justify-center rounded-md bg-white w-[100px] h-[100px]">
        {({selected}) => {
            const isActive = externalSelected !== undefined ? externalSelected : selected;
            return (
                <div>
                    <span className='absolute h-full w-full aspect-square inset-0 overflow-hidden rounded-md'>
                        <Image 
                            fill
                            src={getOptimizedUrl(image.url, 'f_auto,q_auto,w_100,h_100,c_fill')}
                            alt={getAltText(image, productName)}
                            className='object-cover object-center'
                            sizes="100px"
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