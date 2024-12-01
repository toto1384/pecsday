import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Position,
  Handle,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import Image from 'next/image';
import { GetServerSidePropsContext } from 'next';
import { appRouter } from './api/trpc/[trpc]';
import { t } from '../utils/trpcserver';
import { getCookie } from 'cookies-next';
import { tokenName } from '../utils/cookies';
import { DialogOrBottomSheet } from '../components/overflows';
import { trpc } from '../utils/trpc';
import { ExerciseObject, WorkoutExtendedObject, WorkoutObject } from '../utils/types';
import { MdInfo, MdInfoOutline } from 'react-icons/md';

const devMode = true

const CustomNode = ({ data, id }: any) => {
  const skill = skills.find(i => i.id == id)

  return (
    <div className='text-center flex flex-col items-center rounded ' >

      <Handle
        type="source"
        position={data.source ?? Position.Top} // Place the handle on the right
        style={{ background: "green" }}
      />
      <Handle
        type="target"
        position={data.target ?? Position.Bottom} // Place the handle on the left
        style={{ background: "red", }}
      />
      {data.children ? data.children : <div className='cursor-pointer flex flex-col items-center'>
        <Image className='rounded-t border bg-white' width={50} height={50} src={`/skills${skill?.photo!}`} alt='Image' />
        <div className='whitespace-pre-wrap' style={{ fontWeight: "bold", marginBottom: "8px" }}>{skill?.name}{devMode && skill?.workouts ? "✅" : ""}</div>
      </div>}
      {/* {data.children} */}
    </div >
  );
};

type Skill = { id: string, name: string, photo: string, type: string, description?: string, workouts?: string[] | "none" }

const skills: Skill[] = [
  {
    id: 'lsit',
    name: 'L-Sit',
    photo: '/lsit.jpg',
    type: 'beginner',
    description: "The L-Sit is a foundational isometric strength exercise where the athlete maintains a body position forming an 'L' shape. Performed on parallel bars, rings, or the floor, the practitioner lifts their body off the ground by extending their arms straight and holding their legs completely horizontal, creating a 90-degree angle with their torso. This skill demands significant core strength, shoulder stability, and tricep engagement. The L-Sit challenges the athlete's ability to maintain a rigid, straight body while supporting their entire body weight through arm strength. Beginners often struggle with maintaining leg straightness and preventing hip flexor fatigue. Progressions typically involve increasing hold time, transitioning between surfaces, and eventually performing dynamic L-Sit variations.", workouts: ['e744dafd-5699-44c5-938a-d98aac9ab303']
  },
  {
    id: 'skintc',
    name: 'Skin The Cat',
    photo: '/skintc.png',
    type: 'beginner',
    description: "Skin The Cat is a dynamic gymnastic movement primarily performed on rings or a pull-up bar that involves rotating the entire body through a full circular motion. The athlete begins by hanging from the bar, then pulls their legs up and over their head, passing through an inverted position and completing a full rotation back to the starting hang. This skill develops exceptional shoulder mobility, core strength, and body control. The movement requires a delicate balance of strength and flexibility, challenging the practitioner to maintain tension throughout the entire range of motion. Proper technique involves keeping arms locked, maintaining a tight body position, and controlling the descent. It's an excellent exercise for improving shoulder health, increasing range of motion, and building foundational strength for more advanced calisthenics movements.", workouts: ['5b637e29-8186-4b37-8346-318df01f25c7']
  },
  {
    id: 'pullover',
    name: 'Pull Over',
    photo: '/pullover.png',
    type: 'beginner',
    description: "The Pull Over is a fundamental gymnastics and calisthenics skill that demonstrates upper body strength and coordination. Performed on a pull-up bar or gymnastics bar, the movement involves pulling the body from a hanging position up and over the bar in a smooth, controlled arc. The athlete initiates the movement by generating momentum and using a combination of pulling and pushing strength to transition their body from below the bar to above it. This skill requires significant lat strength, shoulder mobility, and core engagement. Beginners often find the movement challenging due to the necessary explosive power and precise body positioning. Progression involves developing the strength to perform the movement with increasing control, eventually leading to more dynamic and stylized variations that showcase body mastery.", workouts: ['45634b51-dcdb-4616-88f3-6db55fe5da0c']
  },
  {
    id: 'crowpose',
    name: 'Crow Pose',
    photo: '/crowpose.jpeg',
    type: 'beginner',
    description: "Crow Pose is a foundational arm balance that bridges yoga and calisthenics, challenging practitioners to support their entire body weight on their hands. The athlete balances their knees on the backs of their upper arms while lifting their feet off the ground, creating a compact, controlled position that demands intense core strength, arm stability, and precise weight distribution. Unlike many calisthenics skills, Crow Pose emphasizes balance and technique over pure strength. Practitioners must learn to shift their center of gravity forward, engaging their core and maintaining a rounded back to prevent falling. The skill develops wrist strength, shoulder stability, and body awareness. Progression involves increasing hold time, transitioning to more advanced arm balances, and eventually learning more complex variations like side crow or crane pose.", workouts: ["4129f817-45e8-45b3-8c51-c15a07dcffbc"]
  },

  {
    id: 'headstand',
    name: 'Headstand',
    type: 'beginner',
    photo: '/headstand.jpeg',
    description: "The Headstand is a classic inverted pose that challenges balance, core strength, and body awareness. In this skill, the athlete balances their entire body weight on their head and forearms, creating a vertical line with the body pointing straight up. Proper execution requires precise alignment of the spine, engaged core muscles, and controlled shoulder and neck engagement. Despite appearing simple, the headstand demands significant upper body and core strength, as well as the confidence to invert one's body completely. Practitioners must develop the ability to maintain a straight line, control subtle body movements, and distribute weight evenly across the forearms. The skill develops shoulder stability, improves body proprioception, and builds the foundational strength necessary for more advanced inverted movements. Beginners often use wall support to build confidence and technique before attempting free-standing headstands.",
    workouts: ['b853bb40-6f0f-434b-a564-3685f1609a1d']
  },
  {
    id: 'planchelean',
    name: 'Planche lean',
    photo: '/planchelean.png',
    type: 'beginner',
    description: "The Planche Lean is a fundamental progression towards the full planche, focusing on developing the specific strength and body positioning required for advanced static holds. In this skill, the athlete leans forward from a push-up position, shifting their body's center of gravity beyond their hands while maintaining straight arms and a rigid body. This movement challenges the practitioner's shoulder strength, core stability, and balance. Unlike a full planche, the lean allows beginners to build the necessary strength and body awareness incrementally. The skill develops incredible shoulder and chest strength, requiring practitioners to engage their entire posterior chain and learn to support body weight in a horizontally extended position. Progression involves increasing the angle of the lean, maintaining tension, and eventually working towards holding a full planche position."
  },

  {
    id: 'elbowlever',
    name: 'Elbow lever',
    photo: '/elbowlever.png',
    type: 'beginner',
    description: "The Elbow Lever is a foundational static hold that demonstrates remarkable body control and upper body strength. Performed by balancing the body horizontally above the ground, supported solely by the elbows, this skill requires precise weight distribution and intense core engagement. The athlete positions their elbows close to the body's center, lifting their legs off the ground while maintaining a straight, rigid body position. Despite appearing simple, the elbow lever demands exceptional tricep strength, shoulder stability, and body awareness. Practitioners must learn to micro-adjust their body's position, finding the delicate balance point where gravity is perfectly counteracted. The skill serves as an excellent progression towards more advanced static holds like the full planche, developing the strength and control necessary for complex calisthenics movements."
  },

  {
    id: 'pistolsquat',
    name: 'Pistol Squat',
    type: 'beginner',
    photo: '/pistolsquat.jpeg',
    description: "The Pistol Squat is the ultimate test of lower body strength, balance, and mobility, representing a single-leg squat performed with the non-working leg extended straight in front of the body. Unlike traditional squats, this skill requires the athlete to lower their entire body weight on a single leg while maintaining perfect balance and control. The movement demands exceptional quadricep strength, ankle mobility, and core stability. Practitioners must develop the ability to descend to a full bottom position with the extended leg remaining completely straight, then drive back up using only the working leg's strength. The pistol squat challenges not just muscular strength, but also proprioception and joint mobility. It serves as an advanced bodyweight exercise that demonstrates true functional strength, requiring years of progressive training to master fully.", workouts: ['f2f7bf6d-1dfd-4e12-ac79-b2f03c0c7aed']
  },


  {
    id: 'handstand',
    name: 'Handstand',
    type: 'intermediate',
    photo: '/handstand.png',
    description: "The Handstand represents a pinnacle of body control in calisthenics, where the athlete balances completely inverted, supporting their entire body weight on their hands in a perfectly vertical position. This skill demands extraordinary shoulder strength, core stability, and precise body alignment. Unlike simpler inversions, a true handstand requires maintaining a completely straight body with zero bend in the hips, knees, or ankles, creating a perfect vertical line. Practitioners must develop incredible shoulder endurance, learn to make minute balance corrections through finger and wrist engagement, and overcome the psychological fear of being completely upside down. The handstand is not just a strength skill but a complex movement that integrates strength, balance, flexibility, and body awareness. Progression involves developing wall support, learning controlled entry and exit techniques, and eventually achieving free-standing holds with minimal movement."
  },

  {
    id: 'dragonflag',
    name: 'Dragon Flag',
    type: 'intermediate',
    photo: '/dragonflag.png',
    description: "The Dragon Flag is an extreme core strength exercise that challenges the entire posterior chain, made famous by martial arts legend Bruce Lee. In this skill, the athlete lies on their back and raises their entire body off the ground, supporting their weight on their shoulders while keeping the body completely rigid and horizontal. This movement requires exceptional core strength, lower back stability, and the ability to maintain tension across multiple muscle groups simultaneously. Practitioners must learn to create a straight line from head to toe, suspending their body above the ground with only their upper back and shoulders in contact with the support surface. The dragon flag develops incredible abdominal strength, teaches full-body tension, and serves as a progression towards more advanced static holds. It demands not just muscle strength, but the ability to maintain total body control under extreme mechanical disadvantage."
  },

  {
    id: 'humanflag',
    name: 'Human Flag',
    type: 'intermediate',
    photo: '/humanflag.png',
    description: "The Human Flag is one of the most visually impressive and challenging calisthenics skills, where the athlete holds their entire body horizontally while gripping a vertical pole or bar. This skill requires extraordinary lateral core strength, shoulder stability, and full-body tension. Practitioners must generate enough horizontal force to counter gravity, creating a perfectly straight body that appears to float parallel to the ground. The movement challenges the athlete's ability to maintain rigidity while supporting their entire body weight through minimal contact points. Success demands not just raw strength, but precise body positioning, incredible grip strength, and the ability to generate lateral force through the upper and lower body. Progression involves developing shoulder and oblique strength, learning to generate full-body tension, and incrementally increasing hold time and body positioning."
  },

  {
    id: 'handstandpushup',
    name: 'Handstand \n Pushup',
    type: 'intermediate',
    photo: '/handstandpushup.png',
    description: "The Handstand Pushup represents the pinnacle of upper body pressing strength in calisthenics, combining the complexity of a handstand with the explosive power of a pushup. Performed while fully inverted, the athlete must lower their body from a perfect handstand position and press back up using pure shoulder and tricep strength. This skill demands extraordinary shoulder strength, precise body control, and the ability to generate pushing power in a completely vertical plane. Unlike traditional pushups, this movement requires practitioners to support and move their entire body weight through a complete range of motion while maintaining perfect body alignment. The handstand pushup develops incredible overhead pressing strength, shoulder stability, and body awareness. Progression involves developing wall-supported variations, gradually increasing range of motion, and learning to control the entire movement with minimal body deviation."
  },

  {
    id: 'tuckedrows',
    name: 'Tucked Rows',
    type: 'intermediate',
    photo: '/tuckedrows.png',
    description: "The Tucked Rows are a foundational static hold that develops incredible pulling strength and body control. In this skill, the athlete hangs from a bar with a tucked body position, pulling their knees close to their chest while maintaining a horizontal body alignment. This movement requires significant lat strength, core engagement, and the ability to generate tension throughout the entire posterior chain. Practitioners must learn to create a compact body position that challenges gravity while maintaining a controlled, static hold. The tucked rows serve as a crucial progression towards more advanced lever variations, helping athletes develop the specific strength and body awareness necessary for front and back levers. The skill demands not just raw pulling strength, but the ability to maintain a precise body position under intense muscular tension.", workouts: ["6947949e-4aaa-42cb-838d-32fb26deb78c"]
  },

  {
    id: 'tuckedplanche',
    name: 'Tucked Planche',
    type: 'intermediate',
    photo: '/tuckedplanche.png',
    description: "The Tucked Planche is a fundamental static hold that bridges the gap between basic strength training and advanced calisthenics skills. In this position, the athlete maintains a horizontal body position supported by straight arms, with knees drawn close to the chest to reduce leverage. This skill demands extraordinary shoulder strength, core stability, and the ability to generate horizontal pushing force. Practitioners must learn to shift their center of gravity forward, creating a position that challenges traditional gravitational constraints. The tucked planche develops incredible shoulder and chest strength, teaching athletes to generate tension and control through precise body positioning. It serves as a critical progression towards full planche holds, requiring practitioners to develop not just strength, but the nuanced body awareness necessary for more advanced static holds."
  },


  {
    id: 'backlever',
    name: 'Back Lever',
    type: 'intermediate',
    photo: '/backlever.png',
    description: "The Back Lever is a sophisticated static hold that demonstrates exceptional pulling strength and body control. In this skill, the athlete hangs from a bar in a fully extended position, body perfectly horizontal with the back facing the ground. This movement requires incredible shoulder mobility, lat strength, and full-body tension. Practitioners must learn to rotate their body beneath the bar, maintaining a completely straight body position while supporting their entire weight in a mechanically challenging orientation. The back lever develops comprehensive posterior chain strength, teaching athletes to generate and maintain tension through a full range of motion. It serves as a crucial progression in lever training, demanding not just raw strength, but the ability to maintain perfect body alignment under extreme mechanical stress."
  },

  {
    id: 'frontlever',
    name: 'Front Lever',
    type: 'intermediate',
    photo: '/frontlever.png',
    description: "The Front Lever represents one of the most challenging static holds in calisthenics, where the athlete maintains a perfectly horizontal body position facing upwards, supported solely by their arms. This skill demands extraordinary lat strength, core stability, and full-body tension. Practitioners must generate enough pulling force to counteract gravity, creating a completely straight body that appears to float parallel to the ground. The front lever challenges the athlete's ability to maintain a rigid body position while supporting their entire weight through minimal contact points. Success requires not just incredible pulling strength, but precise body positioning, full-body tension, and the mental fortitude to maintain an extremely challenging hold. It serves as the ultimate test of upper body and core strength in calisthenics training."
  },

  {
    id: 'onearmpushup',
    name: 'One Arm Pushup',
    type: 'intermediate',
    photo: '/onearmpushup.jpeg',
    description: "The One Arm Pushup is an advanced bodyweight exercise that represents the pinnacle of pushing strength and body control. In this skill, the athlete performs a complete pushup using only a single arm, requiring extraordinary strength, balance, and core stability. Unlike traditional pushups, this movement demands the ability to generate pushing force asymmetrically while maintaining perfect body alignment. Practitioners must develop incredible chest, shoulder, and tricep strength, along with the ability to create full-body tension and balance. The skill challenges not just muscle power, but total body coordination, requiring the athlete to distribute weight evenly and maintain a rigid body position throughout the movement. Progression involves years of systematic strength training, learning to generate unilateral pushing force, and developing the confidence to support the entire body weight through a single point of contact."

  },

  {
    id: 'vsit',
    name: 'V-sit',
    type: 'intermediate',
    photo: '/vsit.png',
    description: "The V-Sit is an advanced core strength skill that demonstrates exceptional body control and isometric strength. In this position, the athlete balances on their sitting bones, lifting both legs and torso off the ground to create a 'V' shape with the body. This skill demands incredible core strength, hip flexor endurance, and full-body tension. Practitioners must generate enough upward force to suspend their legs and upper body while maintaining a perfectly straight body position. Unlike simpler core exercises, the V-Sit requires practitioners to support their entire body weight through minimal contact points, challenging the athlete's ability to create and maintain tension across multiple muscle groups. The movement develops comprehensive core strength, improves body awareness, and serves as a crucial progression for more advanced static holds in calisthenics and gymnastics training."
  },


  {
    id: 'sahp',
    name: 'Straight \narm press',
    type: 'advanced',
    photo: '/sahp.png',
    description: "The Straight Arm Press is an advanced skill that demonstrates exceptional shoulder strength and body control. In this movement, the athlete generates a pressing motion while maintaining completely straight arms, transitioning from a lower position to an overhead hold without bending the elbows. This skill requires extraordinary shoulder stability, full-body tension, and the ability to generate pressing force through a mechanically disadvantaged position. Practitioners must develop incredible strength in the shoulders and upper body, learning to create tension and generate power while maintaining a rigid body position. The straight arm press serves as a pinnacle of shoulder strength and body control, challenging athletes to generate force through a range of motion that traditional pressing movements cannot achieve."
  },


  {
    id: 'straddleplanche',
    name: 'Straddle Planche',
    type: 'advanced',
    photo: '/straddleplanche.png',
    description: "The Straddle Planche represents a sophisticated progression towards the full planche, where the athlete maintains a horizontal body position with legs spread apart to reduce leverage. This advanced skill demands extraordinary shoulder strength, core stability, and full-body tension. Practitioners must generate enough horizontal force to support their entire body weight while maintaining a perfectly straight body, with legs extended outward in a straddle position. Unlike the tucked planche, the straddle variation increases difficulty by extending the legs, creating a more challenging lever arm. The movement requires incredible body control, precise weight distribution, and the ability to generate pushing force from an extreme horizontal position. Athletes must develop not just raw strength, but the nuanced body awareness to maintain tension and balance while defying gravity in this challenging static hold."
  },

  {
    id: 'onearmpullup',
    name: 'One Arm Pullup',
    type: 'advanced',
    photo: '/onearmpullup.jpeg',
    description: "The One Arm Pullup represents the ultimate test of pulling strength in calisthenics, requiring an athlete to perform a complete pullup using only a single arm. This skill demands extraordinary strength, exceptional body control, and years of progressive training. Practitioners must generate enough pulling force to lift their entire body weight through a full range of motion using a single arm, while maintaining perfect body alignment and control. The movement requires not just incredible lat and bicep strength, but also precise technique, balance, and the ability to generate asymmetrical force. Unlike traditional pullups, this skill challenges the athlete's entire body to work as a unified system, developing unparalleled upper body strength and demonstrating the pinnacle of bodyweight pulling capabilities."
  },


  {
    id: '90dhp',
    name: '90° Handstand \n Pushup',
    type: 'advanced',
    photo: '/handstandpushup.png',
    description: "The 90° Handstand Pushup is an extreme variation of the standard handstand pushup, where the athlete performs a pressing movement from a near-horizontal position rather than a vertical one. This advanced skill demands extraordinary shoulder strength, body control, and the ability to generate pressing force from a mechanically challenging angle. Practitioners must develop the strength to press their entire body weight from a position that is almost parallel to the ground, requiring incredible shoulder and tricep strength. The movement challenges not just muscle power, but full-body tension, balance, and the mental fortitude to maintain control in an extremely difficult position. It represents a pinnacle of upper body strength and body control in calisthenics, pushing the boundaries of human physical capability."
  },

  {
    id: 'frontleverpullup',
    name: 'Front Lever Pullup',
    type: 'advanced',
    photo: '/frontlever.png',
    description: "The Front Lever Pullup combines two of the most challenging calisthenics skills into a single, incredibly demanding movement. Practitioners must maintain a front lever position while performing a complete pullup, requiring extraordinary strength, body control, and full-body tension. This skill demands the ability to generate pulling force while simultaneously maintaining a perfectly horizontal body position, challenging the athlete's entire posterior chain. Unlike standard pullups or front lever holds, this movement requires practitioners to generate pulling strength from an extreme horizontal position, maintaining a rigid body throughout the entire range of motion. It represents the ultimate test of pulling strength, body control, and the ability to generate force under extreme mechanical disadvantage."
  },

  {
    id: 'planche',
    name: 'Planche',
    type: 'advanced',
    photo: '/planche.jpeg',
    description: "The Planche is the ultimate demonstration of static strength in calisthenics, where the athlete maintains a horizontal body position supported entirely by straight arms, with no part of the body touching the ground. This skill represents years of progressive training, demanding extraordinary shoulder strength, core stability, and full-body tension. Practitioners must generate enough horizontal force to support their entire body weight while maintaining a perfectly straight, rigid position parallel to the ground. The movement challenges not just muscle strength, but the ability to generate and maintain tension through a completely horizontal plane. Athletes must develop incredible shoulder, chest, and core strength, learning to shift their center of gravity and create a position that defies traditional gravitational constraints. The planche serves as the pinnacle of static strength in bodyweight training."
  },


  {
    id: 'maltese',
    name: 'Maltese',
    type: 'advanced',
    photo: '/maltese.png',
    description: "The Maltese is perhaps the most extreme static hold in calisthenics, representing the ultimate test of upper body strength and body control. In this skill, the athlete maintains a horizontal body position with arms extended out to the sides, creating a cross-like shape while supporting their entire body weight. This movement demands extraordinary shoulder strength, chest stability, and full-body tension beyond what most athletes can comprehend. Practitioners must generate enough lateral and horizontal force to support their body weight through an incredibly challenging position, with arms extended far from the body's center of gravity. The Maltese represents years of dedicated training, requiring not just incredible strength, but the ability to generate and maintain tension through an extreme range of motion that pushes the absolute limits of human physical capability."
  },

]

const initialNodes: Node[] = [
  { id: "start", type: "customNode", data: { label: "Start", children: <>Start</> }, position: { x: 300, y: 650 }, draggable: false },
  { id: "skintc", type: "customNode", data: { label: "Skintc" }, position: { x: 400, y: 500 }, draggable: false },
  { id: "lsit", type: "customNode", data: { label: "Lsit" }, position: { x: 300, y: 500 }, draggable: false },
  { id: "pullover", type: "customNode", data: { label: "Start" }, position: { x: 280, y: 400 }, draggable: false },
  { id: "crowpose", type: "customNode", data: { label: "Start" }, position: { x: 100, y: 500 }, draggable: false },
  { id: "headstand", type: "customNode", data: { label: "Start" }, position: { x: 150, y: 400 }, draggable: false },
  { id: "planchelean", type: "customNode", data: { label: "Start", source: Position.Top, target: Position.Right }, position: { x: 0, y: 400 }, draggable: false },
  { id: "elbowlever", type: "customNode", data: { label: "Start", }, position: { x: 0, y: 300 }, draggable: false },
  { id: "tuckedplanche", type: "customNode", data: { label: "Start", }, position: { x: 0, y: 200 }, draggable: false },
  { id: "dragonflag", type: "customNode", data: { label: "Start", }, position: { x: 280, y: 300 }, draggable: false },
  { id: "humanflag", type: "customNode", data: { label: "Start", }, position: { x: 280, y: 100 }, draggable: false },
  { id: "handstand", type: "customNode", data: { label: "Start", }, position: { x: 150, y: 300 }, draggable: false },
  { id: "handstandpushup", type: "customNode", data: { label: "Start", }, position: { x: 150, y: 180 }, draggable: false },
  { id: "tuckedrows", type: "customNode", data: { label: "Skintc" }, position: { x: 400, y: 400 }, draggable: false },

  { id: "backlever", type: "customNode", data: { label: "Start" }, position: { x: 280, y: 200 }, draggable: false },
  { id: "frontlever", type: "customNode", data: { label: "Start" }, position: { x: 280, y: 0 }, draggable: false },
  { id: "pistolsquat", type: "customNode", data: { label: "Start" }, position: { x: 550, y: 500 }, draggable: false },
  { id: "onearmpushup", type: "customNode", data: { label: "Start" }, position: { x: 550, y: 400 }, draggable: false },

  { id: "vsit", type: "customNode", data: { label: "Start" }, position: { x: 380, y: 200 }, draggable: false },
  { id: "sahp", type: "customNode", data: { label: "Start" }, position: { x: 150, y: 50 }, draggable: false },
  { id: "90dhp", type: "customNode", data: { label: "Start" }, position: { x: 150, y: -100 }, draggable: false },

  { id: "straddleplanche", type: "customNode", data: { label: "Start", }, position: { x: 0, y: 100 }, draggable: false },
  { id: "onearmpullup", type: "customNode", data: { label: "Start" }, position: { x: 500, y: 300 }, draggable: false },

  { id: "frontleverpullup", type: "customNode", data: { label: "Start" }, position: { x: 280, y: -100 }, draggable: false },

  { id: "planche", type: "customNode", data: { label: "Start", }, position: { x: 0, y: 0 }, draggable: false },
  { id: "maltese", type: "customNode", data: { label: "Start", }, position: { x: 0, y: -100 }, draggable: false },

];

const initialEdges = [
  { id: "e1", source: "start", target: "skintc", animated: true, style: { stroke: "black", strokeWidth: 4, strokeDasharray: "5 5", }, },
  { id: "e2", source: "start", target: "lsit", animated: true, style: { stroke: "black", strokeWidth: 4, strokeDasharray: "5 5", }, },
  { id: "e3", source: "lsit", target: "pullover", animated: true, style: { stroke: "black", strokeWidth: 4, strokeDasharray: "5 5", }, },
  { id: "e4", source: "start", target: "crowpose", animated: true, style: { stroke: "black", strokeWidth: 4, strokeDasharray: "5 5", }, },
  { id: "e5", source: "crowpose", target: "headstand", animated: true, style: { stroke: "black", strokeWidth: 4, strokeDasharray: "5 5", }, },
  { id: "e6", source: "crowpose", target: "planchelean", animated: true, style: { stroke: "black", strokeWidth: 4, strokeDasharray: "5 5", }, },
  { id: "e7", source: "planchelean", target: "elbowlever", animated: true, style: { stroke: "black", strokeWidth: 4, strokeDasharray: "5 5", }, },
  { id: "e8", source: "pullover", target: "dragonflag", animated: true, style: { stroke: "black", strokeWidth: 4, strokeDasharray: "5 5", }, },
  { id: "e9", source: "backlever", target: "humanflag", animated: true, style: { stroke: "black", strokeWidth: 4, strokeDasharray: "5 5", }, },
  { id: "e10", source: "headstand", target: "handstand", animated: true, style: { stroke: "black", strokeWidth: 4, strokeDasharray: "5 5", }, },
  { id: "e11", source: "handstand", target: "handstandpushup", animated: true, style: { stroke: "black", strokeWidth: 4, strokeDasharray: "5 5", }, },
  { id: "e12", source: "skintc", target: "tuckedrows", animated: true, style: { stroke: "black", strokeWidth: 4, strokeDasharray: "5 5", }, },
  { id: "e13", source: "elbowlever", target: "tuckedplanche", animated: true, style: { stroke: "black", strokeWidth: 4, strokeDasharray: "5 5", }, },
  { id: "e14", source: "dragonflag", target: "backlever", animated: true, style: { stroke: "black", strokeWidth: 4, strokeDasharray: "5 5", }, },
  { id: "e15", source: "humanflag", target: "frontlever", animated: true, style: { stroke: "black", strokeWidth: 4, strokeDasharray: "5 5", }, },
  { id: "e16", source: "start", target: "pistolsquat", animated: true, style: { stroke: "black", strokeWidth: 4, strokeDasharray: "5 5", }, },
  { id: "e17", source: "dragonflag", target: "vsit", animated: true, style: { stroke: "black", strokeWidth: 4, strokeDasharray: "5 5", }, },
  { id: "e18", source: "handstandpushup", target: "sahp", animated: true, style: { stroke: "black", strokeWidth: 4, strokeDasharray: "5 5", }, },
  { id: "e19", source: "tuckedplanche", target: "straddleplanche", animated: true, style: { stroke: "black", strokeWidth: 4, strokeDasharray: "5 5", }, },
  { id: "e20", source: "pistolsquat", target: "onearmpushup", animated: true, style: { stroke: "black", strokeWidth: 4, strokeDasharray: "5 5", }, },
  { id: "e21", source: "onearmpushup", target: "onearmpullup", animated: true, style: { stroke: "black", strokeWidth: 4, strokeDasharray: "5 5", }, },
  { id: "e22", source: "sahp", target: "90dhp", animated: true, style: { stroke: "black", strokeWidth: 4, strokeDasharray: "5 5", }, },
  { id: "e23", source: "frontlever", target: "frontleverpullup", animated: true, style: { stroke: "black", strokeWidth: 4, strokeDasharray: "5 5", }, },
  { id: "e24", source: "straddleplanche", target: "planche", animated: true, style: { stroke: "black", strokeWidth: 4, strokeDasharray: "5 5", }, },
  { id: "e25", source: "planche", target: "maltese", animated: true, style: { stroke: "black", strokeWidth: 4, strokeDasharray: "5 5", }, },
];

// Node Types
const nodeTypes = {
  customNode: CustomNode,
};

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const [mode, setMode] = useState<"flow" | "list">('flow')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<Skill>()

  const [workoutState, setWorkoutState] = useState<{ loading: boolean, workout: WorkoutExtendedObject | undefined }>()

  useEffect(() => {
    (async () => {
      if (selectedSkill?.workouts) {
        setWorkoutState({ loading: true, workout: undefined });
        const res = await trpc().getWorkout.query({ id: selectedSkill.workouts[0] })

        if (res.success) {
          setWorkoutState({ loading: false, workout: res.workout });
        }

      }

    })();
  }, [selectedSkill])

  const AppBar = (absolute: boolean) => <nav className='absolute top-0 bg-white w-full px-10 shadow'>
    <Image src={'/logo.png'} alt='Pecsday Logo' width={100} height={100} />
  </nav>

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: 'white' }}>
      {mode === 'flow' && <>
        <ReactFlow
          nodesDraggable={false}
          className='90vh'
          nodesConnectable={false}
          nodeTypes={nodeTypes}
          elementsSelectable={false}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(event, node) => {
            setSelectedSkill(skills.find(i => i.id == node.id))
            setDialogOpen(true)
          }}
        />
      </>
      }

      <DialogOrBottomSheet bigWidth onClose={() => { setDialogOpen(false); setSelectedSkill(undefined); setWorkoutState({ loading: false, workout: undefined }) }} closeIcon open={dialogOpen}>
        <div className='w-full flex flex-col-reverse md:flex-row items-start space-x-5 md:mt-10'>
          <div>
            <h2 className='text-2xl font-bold'>{selectedSkill?.name}</h2>
            {selectedSkill?.description}
          </div>
          <Image className='rounded-t border bg-white' width={100} height={100} src={`/skills${selectedSkill?.photo!}`} alt='Image' />

        </div>

        <hr className='my-5' />

        <h2 className='text-2xl mb-5 font-bold'>Workouts</h2>

        {workoutState?.loading ? "Loading..." : <>
          {workoutState?.workout ? <ExerciseComponent workout={workoutState?.workout} /> : <>No workouts Yet</>}
        </>}
      </DialogOrBottomSheet>

      {mode === 'list' && skills.map(i => <div className='flex flex-row items-center'>
        <Image className='rounded-t border bg-white' width={50} height={50} src={`/skills${i?.photo!}`} alt='Image' />
        {i.name}
      </div>)}


      {AppBar(true)}

      {/* {devMode && <button className='absolute bottom-0' onClick={async () => {
        await trpc().add.mutate()
      }}>Do trpc</button>} */}
    </div>
  );
}


export function ExerciseComponent({ workout }: { workout: WorkoutExtendedObject }) {
  const [extended, setExtended] = useState<number | undefined>()
  return <div className='border rounded px-2 py-2'>
    <h3 className='text-xl font-semibold'>{workout.otherFields.name}</h3>
    {workout.exercises.map((i, index) => <div className='flex flex-col py-2 bg-slate-50 my-2 px-2 rounded'>
      <div className='flex flex-row items-center justify-between'>
        <div className='text-lg font-medium'>{index + 1}. {i.details.name}</div>
        <div className='flex flex-row items-center space-x-1'>
          <div className='flex flex-col'>
            <div>{i.repsOrSecs} {i.details.type === 'reps' ? 'reps' : 'sec'}</div>
            <div>{i.rest}s rest</div>
          </div>
          {React.createElement(index === extended ? MdInfo : MdInfoOutline, {
            className: 'h-5 w-5', onClick: () => {
              if (index === extended) {
                setExtended(undefined)
              } else setExtended(index)
            }
          })}
        </div>
      </div>
      {extended == index && <div>
        <iframe width="560" height="315" src={i.details.ytEmbedLink} title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
        {"*3rd party youtube video. All Credits go to the creator."}
      </div>}
    </div>)}
  </div>


}


export async function getServerSideProps({ req, res, query, params }: GetServerSidePropsContext) {

  const token = getCookie(tokenName)

  const caller = t.createCallerFactory(appRouter)({ token: token as string });



  return {
    props: {
    },
  }
}