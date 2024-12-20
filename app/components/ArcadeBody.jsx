// app/components/ArcadeBody.jsx

import React, {useState} from 'react';

/**
 * ArcadeBody Component
 * Renders the arcade interface with styled buttons and images.
 */
export default function ArcadeBody() {
  // State to track if Button A is pressed
  const [isButtonAPressed, setIsButtonAPressed] = useState(false);
  // State to track if Button B is pressed
  const [isButtonBPressed, setIsButtonBPressed] = useState(false);

  /**
   * Function to play a sound
   * @param {string} soundFile - Path to the sound file
   */
  const playSound = (soundFile) => {
    const audio = new Audio(soundFile);
    audio.play();
  };

  /**
   * Dispatches a custom event when Button A is pressed.
   */
  const handleButtonAPress = () => {
    const event = new CustomEvent('arcadeButtonPress', {detail: 'A'});
    window.dispatchEvent(event); // Dispatch event globally
  };

  const handleButtonBPress = () => {
    const event = new CustomEvent('arcadeButtonPress', { detail: 'B' });
    window.dispatchEvent(event);
  };

  /**
   * Dispatches custom events for navigation (Left/Right Buttons)
   */
  const handleLeftButtonPress = () => {
    const event = new CustomEvent('arcadeNavigation', {detail: 'LEFT'});
    window.dispatchEvent(event);
  };

  const handleRightButtonPress = () => {
    const event = new CustomEvent('arcadeNavigation', {detail: 'RIGHT'});
    window.dispatchEvent(event);
  };

  /**
   * Stops event propagation for child button clicks.
   * @param {Event} e - The event object
   */
  const handleEvent = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="flex flex-col">
      {/* Top Gradient */}
      <div className="w-full h-16 bg-gradient-to-t from-zinc-100 to-zinc-600"></div>

      {/* Main Content */}
      <div className="flex flex-col w-full items-center justify-evenly bg-zinc-100">
        <div className="flex flex-col">
          {/* Navigation Buttons */}
          <div className="flex flex-row items-center justify-center">
            {/* Left Column Navigation */}
            <nav
              className="text-center w-[8rem] h-full md:w-[14rem] md:mr-16"
              onClick={handleEvent}
            >
              {/* Left and Right Buttons */}
              <div className="flex justify-between pb-16">
                {/* Left Button */}
                <button
                  id="btn_left"
                  className="text-white relative text-4xl border-x-2 border-b-4 border-zinc-900 bg-zinc-700 p-2 shadow-md active:shadow-sm shadow-black hover:bg-gray-400 active:bg-zinc-800 hover:text-black rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    playSound('/sounds/click-sound.wav');
                    handleLeftButtonPress();
                  }}
                >
                  <span className="flex w-[1.5rem] h-[1.5rem] md:w-[3rem] md:h-[3rem] justify-center items-center rounded-full border-l-[1px] border-t-[1px] shadow-inner shadow-zinc-900 border-zinc-500">
                    <img src="/images/left.svg" alt="Left Arrow" />
                  </span>
                </button>

                {/* Right Button */}
                <button
                  id="btn_right"
                  className="text-white relative text-4xl border-x-2 border-b-4 border-zinc-900 bg-zinc-700 p-2 shadow-md active:shadow-sm shadow-black hover:bg-gray-400 active:bg-zinc-800 hover:text-black rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    playSound('/sounds/click-sound.wav');
                    handleRightButtonPress();
                  }}
                >
                  <span className="flex w-[1.5rem] h-[1.5rem] md:w-[3rem] md:h-[3rem] justify-center items-center rounded-full border-l-[1px] border-t-[1px] shadow-inner shadow-zinc-900 border-zinc-500">
                    <img src="/images/right.svg" alt="Right Arrow" />
                  </span>
                </button>
              </div>
            </nav>

            {/* Arcade Buttons */}
            <nav className="flex gap-4 pl-10" onClick={handleEvent}>
              {/* Button A */}
              <button
                id="buttonA"
                className="font-bold text-gray-600 text-3xl flex-col hover:brightness-125 flex items-center focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  playSound('/sounds/key-punch.mp3');
                  handleButtonAPress();
                }}
                onMouseDown={() => setIsButtonAPressed(true)}
                onMouseUp={() => setIsButtonAPressed(false)}
                onMouseLeave={() => setIsButtonAPressed(false)}
                onTouchStart={() => setIsButtonAPressed(true)}
                onTouchEnd={() => setIsButtonAPressed(false)}
              >
                <img
                  id="imageA"
                  src={
                    isButtonAPressed
                      ? '/images/btn_arc-pressed.png'
                      : '/images/btn_arc.png'
                  }
                  alt="Bouton d'arcade rouge"
                  className="mr-2"
                />
                A
              </button>

              {/* Button B */}
              <button
                id="buttonB"
                className="font-bold text-gray-600 text-3xl flex-col hover:brightness-125 flex items-center focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  playSound('/sounds/key-punch.mp3');
                  
                }}
                onMouseDown={() => setIsButtonBPressed(true)}
                onMouseUp={() => setIsButtonBPressed(false)}
                onMouseLeave={() => setIsButtonBPressed(false)}
                onTouchStart={() => setIsButtonBPressed(true)}
                onTouchEnd={() => setIsButtonBPressed(false)}
              >
                <img
                  id="imageB"
                  src={
                    isButtonBPressed
                      ? '/images/btn_arc-pressed.png'
                      : '/images/btn_arc.png'
                  }
                  alt="Bouton d'arcade rouge"
                  className="mr-2"
                />
                B
              </button>
            </nav>
          </div>

          {/* Banner Image */}
          <div className="mb-8">
            <img
              src="/images/retrosource_banner_main.png"
              alt="Bannière Retro Source"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* Bottom Gradients */}
        <div className="w-full h-[4rem] bg-zinc-100"></div>
        <div className="w-full h-16 bg-gradient-to-t from-zinc-600 to-zinc-100"></div>
      </div>
    </div>
  );
}
