from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import hashlib
import dns.resolver
import socket
from dnsextraction import extract_dns_features

app = Flask(__name__)
CORS(app)

class DNSEntry:
    def __init__(self, domain, ip):
        self.domain = domain
        self.ip = ip

    def hash(self):
        return hashlib.sha256(f"{self.domain}:{self.ip}".encode()).hexdigest()

class Blockchain:
    def __init__(self):
        self.chain = [self.create_genesis_block()]

    def create_genesis_block(self):
        return {
            "index": 0,
            "data": "Genesis Block",
            "prev_hash": None,
            "hash": self.compute_hash(0, "Genesis Block", None)
        }

    def compute_hash(self, index, data, prev_hash):
        block_string = f"{index}:{data}:{prev_hash}"
        return hashlib.sha256(block_string.encode()).hexdigest()

    def add_entry(self, entry):
        last_block = self.chain[-1]
        new_block = {
            "index": len(self.chain),
            "data": entry.hash(),
            "prev_hash": last_block["hash"],
            "hash": self.compute_hash(len(self.chain), entry.hash(), last_block["hash"])
        }
        self.chain.append(new_block)

    def get_chain(self):
        return self.chain

class Node:
    def __init__(self, node_id):
        self.node_id = node_id
        self.status = "neutral"
        self.blockchain = Blockchain()

    def is_valid_ip(self, ip):
        try:
            socket.inet_pton(socket.AF_INET, ip)
            return True
        except socket.error:
            return False

    def check_spamhaus(self, ip):
        try:
            reversed_ip = '.'.join(reversed(ip.split('.')))
            query = f"{reversed_ip}.zen.spamhaus.org"
            dns.resolver.resolve(query, 'A')
            return True
        except dns.resolver.NXDOMAIN:
            return False
        except Exception as e:
            print(f"Spamhaus check error: {e}")
            return False

    def analyze_domain(self, domain):
        try:
            features = extract_dns_features(domain)
            entropy_threshold = 4.0
            if features["entropy"] > entropy_threshold:
                return "malicious"
            return "not malicious"
        except Exception as e:
            print(f"Domain analysis error: {e}")
            return "unknown"

    def vote(self, entry):
        if not self.is_valid_ip(entry.ip):
            return "Error"

        if self.check_spamhaus(entry.ip):
            return "Malicious"

        domain_prediction = self.analyze_domain(entry.domain)
        return "OK" if domain_prediction == "not malicious" else "Malicious"

nodes = []

@app.route("/start_simulation", methods=["POST"])
def start_simulation():
    global nodes
    nodes = [Node(i) for i in range(1, 6)]
    return jsonify({"message": "Simulation started with 5 nodes"}), 200

@app.route("/submit_entry", methods=["POST"])
def submit_entry():
    time.sleep(3)
    global nodes
    data = request.json
    domain = data.get("domain")
    ip = data.get("ip")

    if not domain or not ip:
        return jsonify({"error": "Domain and IP are required"}), 400

    entry = DNSEntry(domain, ip)

    votes = [{"node_id": node.node_id, "vote": node.vote(entry)} for node in nodes]
    malicious_votes = sum(1 for vote in votes if vote["vote"] == "Malicious")

    response = {"votes": votes}

    if malicious_votes > len(nodes) // 2:
        submitting_node = next((node for node in nodes if node.node_id == 1), None)
        if submitting_node:
            submitting_node.status = "banned"
        response.update({"result": "Rejected", "reason": "Malicious entry", "banned_node": submitting_node.node_id})
    else:
        for node in nodes:
            node.blockchain.add_entry(entry)
        response.update({"result": "Accepted", "blockchains": [node.blockchain.get_chain() for node in nodes]})

    return jsonify(response), 200

@app.route("/stop_simulation", methods=["POST"])
def stop_simulation():
    global nodes
    nodes = []
    return jsonify({"message": "Simulation stopped"}), 200

@app.route("/get_blockchains", methods=["GET"])
def get_blockchains():
    if not nodes:
        return jsonify({"error": "Simulation not started"}), 400
    return jsonify({f"Node {node.node_id}": node.blockchain.get_chain() for node in nodes}), 200

if __name__ == "__main__":
    app.run(debug=True)
