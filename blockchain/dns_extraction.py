import subprocess
import tldextract
import re
import math
from collections import Counter
import argparse


def calculate_entropy(s):
    if len(s) == 0:
        return 0
    freq = Counter(s)
    probs = [freq[char] / len(s) for char in freq]
    entropy = -sum(p * math.log2(p) for p in probs)
    return entropy



def encode_value(encoder_script, model_path, field, value):
    try:
        result = subprocess.run(
            ["python", encoder_script, model_path, field, value],
            capture_output=True,
            text=True,
            check=True
        )
        return int(result.stdout.strip())  
    except subprocess.CalledProcessError as e:
        print(f"Error while executing {encoder_script}: {e}")
        return None



def extract_dns_features(domain, encoder_script="encoder.py", model_path="dns_classification_model.pkl"):
    
    extracted = tldextract.extract(domain)
    
    
    subdomains = extracted.subdomain.split('.') if extracted.subdomain else []
    domain_name = extracted.domain
    suffix = extracted.suffix
    
    
    FQDN_count = len(subdomains) + 1  
    
    subdomain_count = len(subdomains)  
    
    subdomain_length = sum(len(sub) for sub in subdomains)  
    
    upper = sum(1 for c in domain if c.isupper())  
    
    lower = sum(1 for c in domain if c.islower())  
    
    numeric = sum(1 for c in domain if c.isdigit())  
    
    special = sum(1 for c in domain if not c.isalnum() and c != '.')  
    
    entropy = calculate_entropy(domain)  
    
    
    labels = len(subdomains) + 1  
    
    
    labels_max = max(len(label) for label in subdomains + [domain_name, suffix]) if subdomains else 0
    
    labels_average = sum(len(label) for label in subdomains + [domain_name, suffix]) / len(subdomains + [domain_name, suffix]) if subdomains else 0
    
    
    longest_word = max(re.findall(r'\w+', domain), key=len) if domain else ""
    
    
    sld = domain_name  
    
    
    domain_length = len(domain)
    
    
    features = {
        'FQDN_count': FQDN_count,
        'subdomain_length': subdomain_length,
        'upper': upper,
        'lower': lower,
        'numeric': numeric,
        'entropy': entropy,
        'special': special,
        'labels': labels,
        'labels_max': labels_max,
        'labels_average': labels_average,
        'longest_word': longest_word,
        'sld': sld,
        'len': domain_length,
        'subdomain': subdomain_count
    }
    
    return features



def main():
    
    parser = argparse.ArgumentParser(description="Extract DNS domain features")
    parser.add_argument("domain", help="DNS domain name to analyze")
    parser.add_argument("--encoder", default="encoder.py", help="Script to encode categories")
    parser.add_argument("--model", default="dns_classification_model.pkl", help="Path to the encoding model")
    
    args = parser.parse_args()
    
    domain = args.domain
    features = extract_dns_features(domain, args.encoder, args.model)
    
    print(f"Features of the domain '{domain}':")
    for key, value in features.items():
        print(f"{key}: {value}")


if __name__ == "__main__":
    main()
