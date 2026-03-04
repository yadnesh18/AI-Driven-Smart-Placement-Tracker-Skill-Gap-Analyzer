import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

const dummySkills = [
  { skill: 'JavaScript', value: 80 },
  { skill: 'React', value: 70 },
  { skill: 'CSS', value: 60 },
  { skill: 'Data Structures', value: 50 },
  { skill: 'Algorithms', value: 40 },
];

const StudentDashboard = () => {
  const missingSkills = ['Docker', 'GraphQL', 'TypeScript'];
  const eligibility = {
    placements: 'Eligible',
    internships: 'Not Eligible',
  };
  const resumeStatus = 'Uploaded';

  return (
    <div className="space-y-6">
      {/* radar chart card */}
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Skill Proficiency</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dummySkills}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                name="You"
                dataKey="value"
                stroke="#3182ce"
                fill="#3182ce"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* eligibility summary card */}
      <div className="bg-white shadow rounded-lg p-4 flex flex-col md:flex-row md:space-x-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">Eligibility Summary</h3>
          <p>Placements: <span className="font-medium">{eligibility.placements}</span></p>
          <p>Internships: <span className="font-medium">{eligibility.internships}</span></p>
        </div>
        <div className="flex-1 mt-4 md:mt-0">
          <h3 className="text-lg font-semibold mb-2">Resume Status</h3>
          <p className={resumeStatus === 'Uploaded' ? 'text-green-600' : 'text-red-600'}>{resumeStatus}</p>
        </div>
      </div>

      {/* missing skills list */}
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Missing Skills</h3>
        <ul className="list-disc list-inside space-y-1">
          {missingSkills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StudentDashboard;

