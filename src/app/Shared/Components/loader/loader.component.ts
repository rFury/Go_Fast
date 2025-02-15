import { Component, inject } from '@angular/core';
import { LoaderService } from '../../Services/loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    @if(loaderService.isLoading('global')){
    <div
      class="fixed inset-0 flex items-center justify-center bg-white z-[1000] animate-fadeIn"
    >
      <div
        class="loading-window fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] bg-[#333] border-[3px] border-[#ffe4e1] rounded-[6px] z-[99] animate-fadeIn"
      >
        <div class="van absolute w-[150px] h-[60px] left-[75px] top-[70px]">
          <!-- Strikes -->
          <div
            class="strike absolute w-[11px] h-[1px] bg-[#ffe4e1] animate-strikes"
          ></div>
          <div
            class="strike strike2 absolute w-[11px] h-[1px] bg-[#ffe4e1] animate-strikes"
            style="animation-delay: 0.05s;"
          ></div>
          <div
            class="strike strike3 absolute w-[11px] h-[1px] bg-[#ffe4e1] animate-strikes"
            style="animation-delay: 0.1s;"
          ></div>
          <div
            class="strike strike4 absolute w-[11px] h-[1px] bg-[#ffe4e1] animate-strikes"
            style="animation-delay: 0.15s;"
          ></div>
          <div
            class="strike strike5 absolute w-[11px] h-[1px] bg-[#ffe4e1] animate-strikes"
            style="animation-delay: 0.2s;"
          ></div>

          <!-- Van body parts -->
          <div
            class="van-detail back absolute h-[30px] w-[80px] top-[15px] left-0 rounded-l-[4px] animate-speed"
          ></div>
          <div
            class="van-detail body absolute h-[30px] w-[90px] top-[15px] left-[10px] rounded-[4px] animate-speed"
          ></div>
          <div
            class="van-detail front absolute h-[30px] w-[40px] top-[15px] left-[100px] rounded-r-[4px] animate-speed"
          ></div>

          <!-- Wheels -->
          <div
            class="van-detail wheel absolute h-[20px] w-[20px] rounded-full top-[40px] left-[20px] border-[3px] border-[#333] animate-spin custom-wheel"
          ></div>
          <div
            class="van-detail wheel wheel2 absolute h-[20px] w-[20px] rounded-full top-[40px] left-[90px] border-[3px] border-[#333] animate-spin custom-wheel"
          ></div>
        </div>

        <div class="text absolute text-[16px] top-[75%] left-[38%]">
          <span>Loading</span>
          <span
            class="dots inline-block overflow-hidden align-bottom animate-dots"
            >...</span
          >
        </div>
      </div>
    </div>

    }
  `,
  styles: [
    `
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes scaleIn {
        from {
          transform: scale(0.9);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      .animate-fadeIn {
        animation: fadeIn 0.3s ease-in-out;
      }

      .animate-scaleIn {
        animation: scaleIn 0.3s ease-in-out;
      }
      @keyframes spin {
        0% {
          transform: translate(2px, 1px) rotate(0deg);
        }
        10% {
          transform: translate(-1px, -3px) rotate(36deg);
        }
        20% {
          transform: translate(-2px, 0px) rotate(72deg);
        }
        30% {
          transform: translate(1px, 2px) rotate(108deg);
        }
        40% {
          transform: translate(1px, -1px) rotate(144deg);
        }
        50% {
          transform: translate(-1px, 3px) rotate(180deg);
        }
        60% {
          transform: translate(-1px, 1px) rotate(216deg);
        }
        70% {
          transform: translate(3px, 1px) rotate(252deg);
        }
        80% {
          transform: translate(-2px, -1px) rotate(288deg);
        }
        90% {
          transform: translate(2px, 1px) rotate(324deg);
        }
        100% {
          transform: translate(1px, -2px) rotate(360deg);
        }
      }

      @keyframes speed {
        0% {
          transform: translate(2px, 1px) rotate(0deg);
        }
        10% {
          transform: translate(-1px, -3px) rotate(-1deg);
        }
        20% {
          transform: translate(-2px, 0px) rotate(1deg);
        }
        30% {
          transform: translate(1px, 2px) rotate(0deg);
        }
        40% {
          transform: translate(1px, -1px) rotate(1deg);
        }
        50% {
          transform: translate(-1px, 3px) rotate(-1deg);
        }
        60% {
          transform: translate(-1px, 1px) rotate(0deg);
        }
        70% {
          transform: translate(3px, 1px) rotate(-1deg);
        }
        80% {
          transform: translate(-2px, -1px) rotate(1deg);
        }
        90% {
          transform: translate(2px, 1px) rotate(0deg);
        }
        100% {
          transform: translate(1px, -2px) rotate(-1deg);
        }
      }

      @keyframes strikes {
        from {
          left: 25px;
        }
        to {
          left: -80px;
          opacity: 0;
        }
      }

      @keyframes dots {
        from {
          width: 0;
        }
        to {
          width: 15px;
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      /* Custom animation utility classes */
      .animate-spin {
        animation: spin 1s linear infinite;
      }

      .animate-speed {
        animation: speed 0.5s linear infinite;
      }

      .animate-strikes {
        animation: strikes 0.2s linear infinite;
      }

      .animate-dots {
        animation: dots 1.5s linear infinite;
      }

      .animate-fadeIn {
        animation: fadeIn 0.4s both;
      }

      /* Custom wheel background similar to the SASS version */
      .custom-wheel {
        background: linear-gradient(
            45deg,
            transparent 45%,
            #ffe4e1 46%,
            #ffe4e1 54%,
            transparent 55%
          ),
          linear-gradient(
            -45deg,
            transparent 45%,
            #ffe4e1 46%,
            #ffe4e1 54%,
            transparent 55%
          ),
          linear-gradient(
            90deg,
            transparent 45%,
            #ffe4e1 46%,
            #ffe4e1 54%,
            transparent 55%
          ),
          linear-gradient(
            0deg,
            transparent 45%,
            #ffe4e1 46%,
            #ffe4e1 54%,
            transparent 55%
          ),
          radial-gradient(
            #ffe4e1 29%,
            transparent 30%,
            transparent 50%,
            #ffe4e1 51%
          ),
          #333;
      }
    `,
  ],
})
export class LoaderComponent {
  public loaderService = inject(LoaderService);
}
