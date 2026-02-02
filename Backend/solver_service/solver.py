import json
from flask import Flask, request, jsonify
from ortools.sat.python import cp_model

app = Flask(__name__)

@app.route("/generate_schedule", methods=["POST"])
def generate_schedule():
   
    try:
        data = request.json

        all_exams = data["exams"]          
        all_students = data["students"]    
        all_rooms = data["rooms"]          
        all_timeslots = data["timeslots"]
        all_instructors = data["instructors"]

        model = cp_model.CpModel()

        
       
       
        assignments = {}

        for exam in all_exams:
            cid = exam["course_id"]
            for room in all_rooms:
                rid = room["room_id"]
                for ts in all_timeslots:
                    tid = ts["timeslot_id"]
                    var_name = f"exam_{cid}_room_{rid}_slot_{tid}"
                    assignments[(cid, rid, tid)] = model.NewBoolVar(var_name)

       
       
        for exam in all_exams:
            cid = exam["course_id"]
            model.AddExactlyOne(
                assignments[(cid, room["room_id"], ts["timeslot_id"])]
                for room in all_rooms
                for ts in all_timeslots
            )

       
        for exam in all_exams:
            cid = exam["course_id"]
            num_students = int(exam["num_students"])
            for room in all_rooms:
                rid = room["room_id"]
                capacity = int(room["capacity"])
                for ts in all_timeslots:
                    tid = ts["timeslot_id"]
                    var = assignments[(cid, rid, tid)]
                    
                    model.Add(num_students <= capacity).OnlyEnforceIf(var)

       
        for room in all_rooms:
            rid = room["room_id"]
            for ts in all_timeslots:
                tid = ts["timeslot_id"]
                vars_here = [
                    assignments[(exam["course_id"], rid, tid)]
                    for exam in all_exams
                ]
                model.AddAtMostOne(vars_here)

       
        instructor_courses = {inst["instructor_id"]: [] for inst in all_instructors}
        for exam in all_exams:
            iid = exam["instructor_id"]
            if iid in instructor_courses:
                instructor_courses[iid].append(exam["course_id"])

        for iid, course_ids in instructor_courses.items():
            for ts in all_timeslots:
                tid = ts["timeslot_id"]
                vars_here = []
                for cid in course_ids:
                    for room in all_rooms:
                        rid = room["room_id"]
                        vars_here.append(assignments[(cid, rid, tid)])
                
                if vars_here:
                    model.AddAtMostOne(vars_here)

       
        for student in all_students:
            student_courses = set(student["course_ids"])
            for ts in all_timeslots:
                tid = ts["timeslot_id"]
                vars_here = []
                for cid in student_courses:
                    for room in all_rooms:
                        rid = room["room_id"]
                       
                        if (cid, rid, tid) in assignments:
                            vars_here.append(assignments[(cid, rid, tid)])
                if vars_here:
                    model.AddAtMostOne(vars_here)

       
        model.Minimize(0)

       
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 120.0  
       
        status = solver.Solve(model)

        if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            solution = []
            for exam in all_exams:
                cid = exam["course_id"]
                for room in all_rooms:
                    rid = room["room_id"]
                    for ts in all_timeslots:
                        tid = ts["timeslot_id"]
                        if solver.Value(assignments[(cid, rid, tid)]) == 1:
                            solution.append({
                                "subject": exam["name"],
                                "date": ts["date"],
                                "startTime": ts["start"],
                                "endTime": ts["end"],
                                "roomNumber": rid,
                                "instructor": exam["instructor_id"],
                                "capacity": room["capacity"],
                                "targetBranch": exam.get("targetBranch"),
                                "targetSemester": exam.get("targetSemester")
                            })
                          
                            break

           
            return jsonify({
                "success": True,
                "schedule": solution,
                "penalty_score": 0
            })

        else:
            
            return jsonify({
                "success": False,
                "message": "No solution found. The problem may be over-constrained.",
                "status_code": int(status)
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"An error occurred: {str(e)}"
        }), 500


if __name__ == "__main__":
    app.run(debug=True, port=5001)
