import React, { useState } from "react";
import {
  IoDesktopOutline,
  IoDocumentText,
  IoLogoBuffer,
} from "react-icons/io5";
import axios from "axios";
import "./App.css";

interface Node {
  id: number;
  x: number;
  y: number;
  decision:
    | "Idle"
    | "Voting"
    | "Malicious"
    | "OK"
    | "Banned"
    | "Stopped"
    | null;
}

interface BlockchainEntry {
  index: number;
  data: string | DNSRecord;
}

interface DNSRecord {
  domain: string;
  ip: string;
}

const App: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 1, x: 200, y: 275, decision: "Stopped" },
    { id: 2, x: 500, y: 100, decision: "Stopped" },
    { id: 3, x: 800, y: 275, decision: "Stopped" },
    { id: 4, x: 650, y: 450, decision: "Stopped" },
    { id: 5, x: 350, y: 450, decision: "Stopped" },
  ]);

  const [simulationStarted, setSimulationStarted] = useState(false);
  const [sendingMalicious, setSendingMalicious] = useState(false);

  const [blockchain, setBlockchain] = useState<BlockchainEntry[]>([
    { index: 0, data: "Genesis Block" },
  ]);

  const [currentEntry, setCurrentEntry] = useState<DNSRecord | null>(null);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [animationData, setAnimationData] = useState({
    visible: false,
    x: 0,
    y: 0,
    opacity: 1,
  });

  const sendDNSEntry = async (isMalicious: boolean) => {
    setSendingMalicious(isMalicious);
    const entry: DNSRecord = isMalicious
      ? { domain: "bvn5rtqzq.com", ip: "45.67.89.123" }
      : { domain: "google.com", ip: "8.8.8.8" };

    setCurrentEntry(entry);

    const node1 = nodes.find((node) => node.id === 1);
    if (node1) {
      startAnimation(node1.x, node1.y);
    }
    setTimeout(() => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => ({
          ...node,
          decision: node.id === 1 ? "Idle" : "Voting",
        }))
      );
    }, 1500);

    try {
      const response = await axios.post(
        "http://localhost:5000/submit_entry",
        entry
      );

      const {
        votes,
        result,
        blockchain: updatedBlockchain,
        reason,
        banned_node,
      } = response.data;

      if (result === "Accepted") {
        setBlockchain(updatedBlockchain);
        setSimulationLogs((prev) => [
          `Entry for ${entry.domain} ACCEPTED`,
          `Added to blockchain at index ${updatedBlockchain.length - 1}`,
          ...prev,
        ]);
      } else {
        setSimulationLogs((prev) =>
          [
            `Entry for ${entry.domain} deemed MALICIOUS`,
            reason ? `Reason: ${reason}` : null,
            banned_node ? `Node ${banned_node} banned` : null,
            ...prev,
          ].filter((log): log is string => log !== null)
        );
      }

      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === 1) {
            return {
              ...node,
              decision: result === "Accepted" ? "Idle" : "Banned",
            };
          }

          const vote = votes.find(
            (v: { node_id: number }) => v.node_id === node.id
          );
          return {
            ...node,
            decision: vote
              ? vote.vote === "Malicious"
                ? "Malicious"
                : "OK"
              : node.decision,
          };
        })
      );
    } catch (error) {
      setSimulationLogs((prev) => [
        `Error submitting entry for ${entry.domain}: ${error}`,
        ...prev,
      ]);
    }

    setTimeout(() => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => ({
          ...node,
          decision: node.id === 1 ? node.decision : "Idle",
        }))
      );
    }, 2000);

    setCurrentEntry(null);
  };

  const startAnimation = (startX: number, startY: number) => {
    const blockchainX = 500;
    const duration = 1500;
    const fadeStart = 0.9;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsedTime = time - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      const newX = startX + progress * (blockchainX - startX);

      const fadeProgress = Math.max(
        0,
        (progress - fadeStart) / (1 - fadeStart)
      );
      const newOpacity = 1 - fadeProgress;

      setAnimationData({
        visible: progress < 1,
        x: newX,
        y: startY,
        opacity: newOpacity,
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    setAnimationData({ visible: true, x: startX, y: startY, opacity: 1 });
    requestAnimationFrame(animate);
  };

  return (
    <div className="p-4 overflow-x-clip bg-gray-100 min-h-screen flex flex-col">
      <div className="flex justify-center space-x-4 mb-4">
        <button
          onClick={() => {
            if (!simulationStarted) {
              axios.post("http://localhost:5000/start_simulation").then(() => {
                setSimulationStarted(true);
                setNodes((prevNodes) =>
                  prevNodes.map((node) => ({
                    ...node,
                    decision: "Idle",
                  }))
                );
              });
            } else {
              axios.post("http://localhost:5000/stop_simulation").then(() => {
                setSimulationStarted(false);
                setNodes((prevNodes) =>
                  prevNodes.map((node) => ({
                    ...node,
                    decision: node.id === 1 ? node.decision : "Stopped",
                  }))
                );
              });
              setSimulationStarted(false);
            }
          }}
          className={`px-4 w-52 py-2 rounded ${
            simulationStarted
              ? "bg-red-500 hover:bg-red-600 -translate-x-4"
              : "bg-blue-500 hover:bg-blue-600 translate-x-32"
          } text-white`}
        >
          {simulationStarted ? "Stop Simulation" : "Start Simulation"}
        </button>
        {simulationStarted && (
          <div className="-translate-x-8">
            <button
              onClick={() => sendDNSEntry(false)}
              className="bg-green-500  text-white mx-2 px-4 py-2 rounded hover:bg-green-600"
            >
              Send OK Entry
            </button>
            <button
              onClick={() => sendDNSEntry(true)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Send Malicious Entry
            </button>
          </div>
        )}
      </div>

      <div className="flex-grow flex">
        <div className="w-2/3 bg-white rounded-lg shadow-lg p-4 relative">
          <h2 className="text-xl font-bold mb-4">Blockchain Network</h2>
          <svg width="100%" height="500" className="absolute top-0 left-0">
            {animationData.visible && (
              <g>
                <circle
                  cx={animationData.x}
                  cy={animationData.y}
                  r="20"
                  fill={sendingMalicious ? "#EF4444" : "#10B981"}
                  style={{ opacity: animationData.opacity }}
                  className="node-circle"
                />
                <foreignObject
                  x={animationData.x - 15}
                  y={animationData.y - 12}
                  width="30"
                  height="30"
                >
                  <div>
                    <IoDocumentText
                      size={20}
                      color="white"
                      style={{
                        display: "block",
                        margin: "auto",
                        opacity: animationData.opacity,
                      }}
                    />
                  </div>
                </foreignObject>
              </g>
            )}

            {nodes.map((node) => (
              <g key={node.id}>
                <line
                  x1={node.x}
                  y1={node.y}
                  x2="500"
                  y2="275"
                  stroke="#CBD5E1"
                  strokeDasharray="5,5"
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="50"
                  fill={
                    !simulationStarted
                      ? "#D1D5DB"
                      : node.decision === "Idle"
                      ? "#1F509A"
                      : node.decision === "Voting"
                      ? "#FBBF24"
                      : node.decision === "OK"
                      ? "#10B981"
                      : node.decision === "Malicious"
                      ? "#EF4444"
                      : "#6B7280"
                  }
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dy=".3em"
                  className="fill-white font-bold"
                >
                  Node {node.id}
                </text>
                <foreignObject
                  x={node.x - 15}
                  y={node.y - 40}
                  width="30"
                  height="30"
                >
                  <IoDesktopOutline
                    size={30}
                    color="white"
                    style={{ display: "block", margin: "auto" }}
                  />
                </foreignObject>
                <text
                  x={node.x}
                  y={node.y + 20}
                  textAnchor="middle"
                  dy=".3em"
                  className="fill-white font-bold"
                >
                  {node.decision}
                </text>
              </g>
            ))}

            <rect
              x="41.5%"
              y="50%"
              width="200"
              height="55"
              fill="#373A40"
              rx="10"
              ry="10"
            />
            <text
              x="50%"
              y="55%"
              textAnchor="middle"
              dy=".3em"
              className="fill-white font-bold"
            >
              Blockchain Ledger
            </text>
            <foreignObject x="50%" y="52%" width="180" height="30">
              <IoLogoBuffer
                size={30}
                color="white"
                style={{ display: "block", margin: "auto" }}
              />
            </foreignObject>
          </svg>
        </div>

        <div className="w-1/3 pl-4">
          {currentEntry && (
            <div className="bg-blue-100 p-4 rounded mb-4">
              <h3 className="font-bold">Current Entry</h3>
              <p>Domain: {currentEntry.domain}</p>
              <p>IP: {currentEntry.ip}</p>
            </div>
          )}

          <div className="bg-[#373A40] p-4 rounded shadow">
            <h3 className="font-bold mb-2 text-white">
              Blockchain Ledger{" "}
              <IoLogoBuffer className=" inline-block" size={30} color="white" />
            </h3>
            {blockchain.map((block, index) => (
              <div
                key={index}
                className="p-2 mb-1 bg-gray-100 rounded "
                style={{
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "normal",
                }}
              >
                Block {index}: {JSON.stringify(block.data)}
              </div>
            ))}
          </div>

          <div className="bg-white p-4 rounded shadow mt-4">
            <h3 className="font-bold mb-2">Simulation Logs</h3>
            {simulationLogs.slice(0, 5).map((log, index) => (
              <div key={index} className="p-2 mb-1 bg-gray-100 rounded">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
