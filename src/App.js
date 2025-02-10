import "./App.css";
import React, { useState, useEffect } from "react";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "@aws-amplify/api";
import { Amplify } from "@aws-amplify/core";
import awsconfig from "./aws-exports";
import { createProfile } from "./graphql/mutations";
import { listProfiles } from "./graphql/queries";
import SignOut from "./SignOut";

// Configure Amplify
Amplify.configure(awsconfig);

const client = generateClient();

const App = () => {
  const [profiles, setProfiles] = useState([]);
  const [openToWorkProfiles, setOpenToWorkProfiles] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    jobRole: "",
    experience: 0,
    openToWork: false,
  });

  useEffect(() => {
    fetchProfiles();
    fetchOpenToWorkProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const result = await client.graphql({ query: listProfiles });
      setProfiles(result.data.listProfiles.items);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  };

  const fetchOpenToWorkProfiles = async () => {
    try {
      const result = await client.graphql({
        query: listProfiles,
        variables: { filter: { openToWork: { eq: true } } },
      });
      setOpenToWorkProfiles(result.data.listProfiles.items);
      console.log("Open to Work Profiles:", result.data.listProfiles.items);
    } catch (error) {
      console.error("Error fetching Open to Work profiles:", error);
    }
  };

  const addProfile = async () => {
    if (!formData.name || !formData.jobRole) return;
    try {
      await client.graphql({
        query: createProfile,
        variables: { input: formData },
      });
      setFormData({ name: "", jobRole: "", experience: 0, openToWork: false });
      fetchProfiles();
      fetchOpenToWorkProfiles();
    } catch (error) {
      console.error("Error adding profile:", error);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      // Fetch Open to Work profiles using GraphQL API
      const result = await client.graphql({
        query: listProfiles,
        variables: { filter: { openToWork: { eq: true } } },
      });
  
      const profiles = result.data.listProfiles.items;
  
      if (profiles.length === 0) {
        alert("No Open to Work profiles found.");
        return;
      }
  
      // Convert data to CSV format
      const csvHeader = "Name,Job Role,Experience,Open to Work\n";
      const csvRows = profiles.map(profile => 
        `${profile.name},${profile.jobRole},${profile.experience},${profile.openToWork}`
      );
  
      const csvContent = csvHeader + csvRows.join("\n");
  
      // Create a Blob and trigger download
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "open_to_work_profiles.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading CSV:", error);
    }
  };
  

  return (
    <div className="app-container">
      <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Welcome to LinkedIn Profile Manager</h1>
        <SignOut />
      </div>

      <div className="form-container">
        <h2>Add LinkedIn Profile</h2>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Job Role"
          value={formData.jobRole}
          onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
        />
        <input
          type="number"
          placeholder="Experience (years)"
          value={formData.experience}
          onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })}
        />
        <label>
          Open to Work
          <input
            type="checkbox"
            checked={formData.openToWork}
            onChange={(e) => setFormData({ ...formData, openToWork: e.target.checked })}
          />
        </label>
        <button onClick={addProfile}>Add Profile</button>
      </div>

      <h2>All Profiles</h2>
      <ul>
        {profiles.map((profile) => (
          <li key={profile.id}>
            {profile.name} - {profile.jobRole} ({profile.experience} years) -{" "}
            {profile.openToWork ? "Open to Work" : "Not Open to Work"}
          </li>
        ))}
      </ul>

      <h2>Open to Work Profiles</h2>
      <ul>
        {openToWorkProfiles.map((profile) => (
          <li key={profile.id}>
            {profile.name} - {profile.jobRole} ({profile.experience} years)
          </li>
        ))}
      </ul>

      <button onClick={handleDownloadCSV}>Download CSV</button>
    </div>
  );
};

export default withAuthenticator(App);
