# Decentralized DNS Security with ML-Powered Threat Detection

DNSentinel is a proof-of-concept research project that reimagines DNS resolution through a decentralized and distributed ledger-based approach. By moving away from the traditional centralized DNS server model, DNSentinel introduces a system where DNS records are collaboratively managed and validated by participating nodes in the network.

You can find a detailed explanation of our approach in this paper [here]([https://github.com/user-attachments/files/19608874/paper.pdf](https://drive.google.com/file/d/1qiFBGEVUJ1wc6al9MOowmX0l60aXbS8t/view?usp=sharing)).

## Demo 🎥

https://github.com/user-attachments/assets/041a74a6-4c31-4d38-9a36-bf593405c1a6

## Key Features 🔗

- **Decentralized DNS Ledger**: 🔋 DNS records are stored in a distributed ledger that every participating node maintains a copy of.
- **Peer-to-Peer Submission and Voting**: ✌️ Nodes can submit DNS entries, which are then either accepted or rejected through a voting process.
- **Malicious Node Detection**: 🤖 Each node runs a machine learning agent to evaluate and flag potentially malicious nodes.
- **Built on practical Byzantine Fault Tolerance (pFBT)**: ⚡️ The system leverages a pFBT-based mechanism to ensure trustworthiness and resilience.

## How It Works ⚙️

1. **DNS Record Submission**: A node submits a new or updated DNS record to the network.
2. **Validation via Voting**: Other nodes in the network vote on the submission’s validity. This decision is informed by their ML agents’ assessment of the submitting node’s behavior and reputation.
3. **Consensus and Ledger Update**: If the submission gains enough votes, the record is added to the ledger. If rejected, it is discarded.
4. **Node Reputation Management**: ⛔️ Nodes with consistent malicious behavior are flagged and banned, reducing their influence in the network.

## Usage 🌐

1. Clone the `dnsentinel` repository and navigate to the project directory:
```bash
$ git clone https://github.com/yourusername/dnsentinel.git
$ cd dnsentinel
```

2. Start the Flask API by navigating to the `network` folder and running `network.py`:
```bash
$ cd network
$ python network.py
```

3. Launch the frontend simulation by navigating to the `simulation` folder and starting the development server:
```bash
$ cd ../simulation
$ npm run dev
```

## Roadmap 🔄

- Enhance ML agent accuracy for malicious behavior detection.
- Implement a user-friendly web interface for managing nodes.
- Introduce cryptographic mechanisms to further secure the voting and ledger processes.
- Expand network simulation capabilities for stress testing.

## License 🔒

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Acknowledgments 🎉

- The concept is inspired by decentralized systems and the need for more resilient DNS solutions.
- Special thanks to my teammates Nidhal Jabnouni, Yassine Belarbi, Aziz Hadj Khalifa & Bassem Larguech!

---

Feel free to report issues or suggest improvements through the GitHub Issues section. Let’s build a more secure and robust DNS ecosystem together! 🚀

