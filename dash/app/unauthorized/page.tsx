"use client";

import React from "react";
import Head from "next/head";

export default function UnauthorizedPage() {
  return (
    <>
      <Head>
        <title>403 - Unauthorized</title>
        <link
          href="https://fonts.googleapis.com/css?family=Varela+Round"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Poppins"
          rel="stylesheet"
        />
      </Head>

      <div className="unauth-body">
        <div className="content-wrapper">
          <div className="text-section">
            <div className="message">You are not authorized.</div>
            <div className="message2">
              You tried to access a page you did not have prior authorization for.
            </div>
            <div className="neon">403</div>
          </div>
          <div className="door-section">
            <div className="frame">
              <div className="door-frame">
                <div className="door">
                  <div className="rectangle" />
                  <div className="handle" />
                  <div className="window">
                    <div className="eye" />
                    <div className="eye eye2" />
                    <div className="leaf" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .unauth-body {
            background-color: #1c2127;
            height: 100%;
            font-family: 'Poppins', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 1rem;
          }
            @media (min-width: 768px) {
            .unauth-body {
              height: 100vh;
            }
          }

          .content-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            max-width: 1200px;
          }

          @media (min-width: 768px) {
            .content-wrapper {
              flex-direction: row;
              justify-content: space-between;
              align-items: center;
            }
          }

          .text-section {
            text-align: center;
            color: white;
            margin-bottom: 2rem;
          }

          @media (min-width: 768px) {
            .text-section {
              text-align: left;
              max-width: 500px;
              margin-bottom: 0;
            }
          }

          .message {
            font-size: 30px;
            font-weight: 500;
            margin-bottom: 1rem;
          }

          .message2 {
            font-size: 18px;
            font-weight: 300;
            margin-bottom: 1.5rem;
          }

          .neon {
            font-family: 'Varela Round', sans-serif;
            font-size: 90px;
            color: #5be0b3;
            letter-spacing: 3px;
            text-shadow: 0 0 5px #6eecc1;
            animation: flux 2s linear infinite;
          }

          .door-section {
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .frame {
            width: 300px;
            height: 500px;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .door-frame {
            height: 495px;
            width: 295px;
            border-radius: 90px 90px 0 0;
            background-color: #8594a5;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .door {
            height: 450px;
            width: 250px;
            border-radius: 70px 70px 0 0;
            background-color: #a0aec0;
            position: relative;
          }

          .rectangle {
            height: 70px;
            width: 25px;
            background-color: #cbd8e6;
            border-radius: 4px;
            position: absolute;
            top: 220px;
            left: 20px;
          }

          .handle {
            height: 8px;
            width: 50px;
            border-radius: 4px;
            background-color: #ebf3fc;
            position: absolute;
            top: 250px;
            left: 30px;
          }

          .window {
            height: 40px;
            width: 130px;
            background-color: #1c2127;
            border-radius: 3px;
            margin: 80px auto;
            position: relative;
          }

          .eye {
            top: 15px;
            left: 25px;
            height: 5px;
            width: 15px;
            border-radius: 50%;
            background-color: white;
            animation: eye 7s ease-in-out infinite;
            position: absolute;
          }

          .eye2 {
            left: 65px;
          }

          .leaf {
            height: 40px;
            width: 130px;
            background-color: #8594a5;
            border-radius: 3px;
            margin: 80px auto;
            animation: leaf 7s infinite;
            transform-origin: right;
          }

          @keyframes leaf {
            0% {
              transform: scaleX(1);
            }
            5% {
              transform: scaleX(0.2);
            }
            70% {
              transform: scaleX(0.2);
            }
            75% {
              transform: scaleX(1);
            }
            100% {
              transform: scaleX(1);
            }
          }

          @keyframes eye {
            0% {
              opacity: 0;
              transform: translateX(0);
            }
            5% {
              opacity: 0;
            }
            15% {
              opacity: 1;
              transform: translateX(0);
            }
            20% {
              transform: translateX(15px);
            }
            35% {
              transform: translateX(15px);
            }
            40% {
              transform: translateX(-15px);
            }
            60% {
              transform: translateX(-15px);
            }
            65% {
              transform: translateX(0);
            }
          }

          @keyframes flux {
            0%,
            100% {
              text-shadow: 0 0 5px #00ffc6, 0 0 15px #00ffc6, 0 0 50px #00ffc6,
                0 0 50px #00ffc6, 0 0 2px #b9ffe8, 2px 2px 3px #12e29c;
              color: #4bffef;
            }
            50% {
              text-shadow: 0 0 3px #00b58d, 0 0 7px #00b58d, 0 0 25px #00b58d,
                0 0 25px #00b58d, 0 0 2px #00b58d, 2px 2px 3px #006a60;
              color: #63d3ae;
            }
          }
        `}</style>
      </div>
    </>
  );
}
