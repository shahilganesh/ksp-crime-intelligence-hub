import os
from flask import Flask, render_template, request, jsonify
from crime_database import CrimeDatabase
from ai_engine import AIEngine
from analytics_engine import AnalyticsEngine

app = Flask(__name__, template_folder="templates", static_folder="static")

# Initialize modules
db = CrimeDatabase()
ai_engine = AIEngine(db)
analytics_engine = AnalyticsEngine(db)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/query", methods=["POST"])
def query():
    data = request.get_json() or {}
    session_id = data.get("session_id", "default_session")
    user_query = data.get("query", "")
    language = data.get("language", "en")
    role = data.get("role", "Investigator")

    if not user_query:
        return jsonify({"error": "Query cannot be empty"}), 400

    res = ai_engine.process_query(session_id, user_query, language, role)
    return jsonify(res)

@app.route("/api/clear_chat", methods=["POST"])
def clear_chat():
    data = request.get_json() or {}
    session_id = data.get("session_id", "default_session")
    ai_engine.clear_session(session_id)
    return jsonify({"status": "success", "message": "Session history cleared"})

@app.route("/api/train_model", methods=["POST"])
def train_model():
    res = analytics_engine.train_models_pipeline()
    return jsonify(res)

@app.route("/api/network", methods=["GET"])
def network():
    filter_group = request.args.get("group", "all")
    res = analytics_engine.get_network_graph(filter_group)
    return jsonify(res)

@app.route("/api/gis", methods=["GET"])
def gis():
    res = analytics_engine.get_gis_hotspots()
    return jsonify(res)

@app.route("/api/socio", methods=["GET"])
def socio():
    res = analytics_engine.get_socio_demographics()
    return jsonify(res)

@app.route("/api/profiling", methods=["GET"])
def profiling():
    res = analytics_engine.get_offender_profiling()
    return jsonify(res)

@app.route("/api/financial", methods=["GET"])
def financial():
    res = analytics_engine.get_financial_analysis()
    return jsonify(res)

@app.route("/api/forecasting", methods=["GET"])
def forecasting():
    res = analytics_engine.get_forecasting()
    return jsonify(res)

@app.route("/api/audit_logs", methods=["GET"])
def audit_logs():
    return jsonify(db.audit_logs)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5050, debug=True)
