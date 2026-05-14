const demoData = {
  id: "grandparent",
  name: "Ramesh Sharma",
  role: "Patriarch",
  children: [
    {
      id: "parent1",
      name: "Vikash Sharma",
      role: "Son",
      children: [
        { id: "child1", name: "Arjun Sharma", role: "Grandson" },
        { id: "child2", name: "Priya Sharma", role: "Daughter-in-law" }
      ]
    },
    {
      id: "parent2",
      name: "Anita Sharma",
      role: "Daughter",
      children: [
        { id: "child3", name: "Kavya", role: "Granddaughter" }
      ]
    }
  ]
};

export default demoData;
