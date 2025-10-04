import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, Briefcase } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

const Candidates = () => {
  const stages = [
    {
      name: "New Applications",
      color: "border-primary",
      candidates: [
        { name: "Sarah Johnson", email: "sarah.j@email.com", phone: "+1 234-567-8901", position: "Senior Developer", skills: ["React", "Node.js", "AWS"] },
        { name: "Michael Chen", email: "m.chen@email.com", phone: "+1 234-567-8902", position: "Product Manager", skills: ["Agile", "Product Strategy", "Analytics"] },
        { name: "Emily Davis", email: "emily.d@email.com", phone: "+1 234-567-8903", position: "UX Designer", skills: ["Figma", "UI/UX", "Prototyping"] },
      ],
    },
    {
      name: "Phone Screen",
      color: "border-accent",
      candidates: [
        { name: "James Wilson", email: "j.wilson@email.com", phone: "+1 234-567-8904", position: "Data Analyst", skills: ["SQL", "Python", "Tableau"] },
        { name: "Lisa Anderson", email: "lisa.a@email.com", phone: "+1 234-567-8905", position: "DevOps Engineer", skills: ["Docker", "Kubernetes", "CI/CD"] },
      ],
    },
    {
      name: "Interview",
      color: "border-success",
      candidates: [
        { name: "David Martinez", email: "d.martinez@email.com", phone: "+1 234-567-8906", position: "Backend Developer", skills: ["Java", "Spring", "Microservices"] },
        { name: "Anna Kim", email: "anna.k@email.com", phone: "+1 234-567-8907", position: "Frontend Developer", skills: ["Vue.js", "TypeScript", "CSS"] },
        { name: "Robert Taylor", email: "r.taylor@email.com", phone: "+1 234-567-8908", position: "QA Engineer", skills: ["Selenium", "Jest", "Automation"] },
      ],
    },
    {
      name: "Offer",
      color: "border-warning",
      candidates: [
        { name: "Jessica Brown", email: "j.brown@email.com", phone: "+1 234-567-8909", position: "Marketing Manager", skills: ["SEO", "Content", "Strategy"] },
      ],
    },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Candidate Pipeline</h1>
        <p className="text-muted-foreground">Track candidates through your hiring process</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {stages.map((stage) => (
            <div key={stage.name} className="space-y-4">
              <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${stage.color} bg-card`}>
                <h3 className="font-semibold text-foreground">{stage.name}</h3>
                <Badge variant="secondary">{stage.candidates.length}</Badge>
              </div>
              
              <div className="space-y-3">
                {stage.candidates.map((candidate) => (
                  <Card key={candidate.email} className="transition-all hover:shadow-md cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground text-sm mb-1 truncate">
                            {candidate.name}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                            <Briefcase className="w-3 h-3" />
                            <span className="truncate">{candidate.position}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{candidate.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                            <Phone className="w-3 h-3" />
                            <span>{candidate.phone}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {candidate.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Candidates;
