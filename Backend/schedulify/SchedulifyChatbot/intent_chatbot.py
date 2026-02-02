import json
import random
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
from flask import Flask, request, jsonify
import os
import sys


app = Flask(__name__)


script_dir = os.path.dirname(os.path.realpath(__file__))
intents_path = os.path.join(script_dir, 'intents.json')

try:
    with open(intents_path, encoding='utf-8') as f:
        all_intents = json.load(f)
except FileNotFoundError:
    print(f"Error: intents.json not found at {intents_path}", file=sys.stderr)
    all_intents = {"intents": []}


def train_model_for_role(role):
    role_intents = [
        i for i in all_intents["intents"]
        if i.get("role", "student").lower() in [role, "all"]
    ]

    sentences = []
    labels = []

    for intent in role_intents:
        for pattern in intent["patterns"]:
            sentences.append(pattern)
            labels.append(intent["tag"])

    if not sentences:
        return None, None, None, None

    vectorizer = CountVectorizer(lowercase=True, stop_words='english')

    X = vectorizer.fit_transform(sentences)

    unique_labels = list(set(labels))
    label_to_id = {l: i for i, l in enumerate(unique_labels)}
    id_to_label = {i: l for l, i in label_to_id.items()}
    y = np.array([label_to_id[label] for label in labels])

    model = LogisticRegression()
    model.fit(X, y)

    return model, vectorizer, id_to_label, role_intents

# Train once for both roles
trained_models = {
    "student": train_model_for_role("student"),
    "instructor": train_model_for_role("instructor"),
}


def chatbot_response(user_input, role="student"):
    model, vectorizer, id_to_label, role_intents = trained_models.get(role, (None, None, None, None))

    if model is None:
        return "🤖 No intents available for your role."

    try:
        input_vec = vectorizer.transform([user_input])
        pred_id = model.predict(input_vec)[0]
        intent = id_to_label[pred_id]

        for i in role_intents:
            if i["tag"] == intent:
                return random.choice(i["responses"])


        for i in all_intents["intents"]:
            if i["tag"] == "fallback":
                return random.choice(i["responses"])

        return "🤖 I didn’t understand that."

    except Exception as e:
        return f"An error occurred: {str(e)}"


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        if not data or "query" not in data:
            return jsonify({"success": False, "message": "Missing 'query' in request body"}), 400

        user_query = data["query"]
        user_role = data.get("role", "student").lower()

        response_message = chatbot_response(user_query, role=user_role)

        return jsonify({
            "success": True,
            "role": user_role,
            "message": response_message
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"An error occurred: {str(e)}"
        }), 500


if __name__ == "__main__":
    app.run(debug=True, port=5002)
