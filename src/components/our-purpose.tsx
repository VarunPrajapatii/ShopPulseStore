import React from 'react'
import Image from 'next/image'

const OurPurpose = () => {
  return (
    <section className="w-full  py-8 lg:py-16">
      <div className="flex flex-col lg:flex-row min-h-[500px]">
        {/* Left side - Main image with overlay text */}
        <div className="relative  w-full rounded-r-3xl lg:w-1/2 min-h-[400px] lg:min-h-[600px]">
          <Image
            src="/temp.jpeg"
            alt="Pure Essence organic powders"
            fill
            className="object-cover brightness-75 rounded-xl"
            style={{ objectPosition: '19.2908% 63.3115%' }}
          />
          
          {/* Overlay content */}
          <div className="absolute  inset-0 bg-opacity-30 flex flex-col  justify-center items-center p-6 sm:p-8 lg:p-16">
            <div>
              <h2 className="text-white  text-3xl sm:text-4xl lg:text-7xl font-bold leading-tight mb-4">
                Our
                Purpose
              </h2>
              <p className="text-white text-base sm:text-xl max-w-md leading-relaxed">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Repudiandae eos voluptate excepturi quisquam libero officiis eaque hic beatae ab facilis reiciendis dignissimos laboriosam minus nam doloremque, sequi repellat necessitatibus! Dolorum.
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Content blocks */}
        <div className="w-full lg:w-1/2  p-6 sm:p-8 lg:p-16">
          <div className="space-y-8">
            
            {/* Block 1 - Pure & Natural */}
            <div className="flex  gap-4 lg:gap-8 pb-6 sm:pb-8 border-b border-gray-200">
              <div className="flex-shrink-0">
                <Image
                  src="/temp.jpeg"
                  alt="Lorem Ipsum Tag 1"
                  width={190}
                  height={124}
                  className="sm:w-[120px] sm:h-[110px] md:w-[160px] md:h-[150px] lg:w-[192px] lg:h-[120px] h-auto object-cover rounded-lg"
                />
              </div>
              <div className="flex-grow">
                <h3 className="text-lg sm:text-2xl font-semibold text-gray-800 mb-2">
                  Lorem Ipsum Tag 1
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit. Possimus unde aliquam repellat. Blanditiis delectus
                </p>
              </div>
            </div>

            {/* Block 2 - Traditional Wisdom */}
            <div className="flex gap-4 lg:gap-8 pb-6 sm:pb-8 border-b border-gray-200">
              <div className="flex-shrink-0">
                <Image
                  src="/temp.jpeg"
                  alt="Lorem Ipsum Tag 2"
                  width={192}
                  height={108}
                  className="sm:w-[120px] sm:h-[110px] md:w-[160px] md:h-[150px] lg:w-[192px] lg:h-[120px] h-auto object-cover rounded-lg"
                />
              </div>
              <div className="flex-grow">
                <h3 className="text-lg sm:text-2xl font-semibold text-gray-800 mb-2">
                  Lorem Ipsum Tag 2
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit. Possimus unde aliquam repellat. Blanditiis delectus
                </p>
              </div>
            </div>

            {/* Block 3 - Quality Assurance */}
            <div className="flex gap-4 lg:gap-8 pb-6 sm:pb-8 border-b border-gray-200">
              <div className="flex-shrink-0">
                <Image
                  src="/temp.jpeg"
                  alt="Lorem Ipsum Tag 3"
                  width={190}
                  height={124}
                  className="sm:w-[120px] sm:h-[110px] md:w-[160px] md:h-[150px] lg:w-[192px] lg:h-[120px] h-auto object-cover rounded-lg"
                />
              </div>
              <div className="flex-grow">
                <h3 className="text-lg sm:text-2xl font-semibold text-gray-800 mb-2">
                  Lorem Ipsum Tag 3
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit. Possimus unde aliquam repellat. Blanditiis delectus
                </p>
              </div>
            </div>

            {/* Block 4 - Sustainable Sourcing */}
            <div className="flex gap-4 lg:gap-8 pb-6 sm:pb-8 border-b border-gray-200">
              <div className="flex-shrink-0">
                <Image
                  src="/temp.jpeg"
                  alt="Lorem Ipsum Tag 4"
                  width={190}
                  height={124}
                  className="sm:w-[120px] sm:h-[110px] md:w-[160px] md:h-[150px] lg:w-[192px] lg:h-[120px] h-auto object-cover rounded-lg"
                />
              </div>
              <div className="flex-grow">
                <h3 className="text-lg sm:text-2xl font-semibold text-gray-800 mb-2">
                  Lorem Ipsum Tag 4
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit. Possimus unde aliquam repellat. Blanditiis delectus
                </p>
              </div>
            </div>

            {/* Block 5 - Wellness Connection */}
            <div className="flex gap-4 lg:gap-8">
              <div className="flex-shrink-0">
                <Image
                  src="/temp.jpeg"
                  alt="Lorem Ipsum Tag 5"
                  width={190}
                  height={124}
                  className="sm:w-[120px] sm:h-[110px] md:w-[160px] md:h-[150px] lg:w-[192px] lg:h-[120px] h-auto object-cover rounded-lg"
                />
              </div>
              <div className="flex-grow">
                <h3 className="text-lg sm:text-2xl font-semibold text-gray-800 mb-2">
                  Lorem Ipsum Tag 5
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit. Possimus unde aliquam repellat. Blanditiis delectus
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

export default OurPurpose