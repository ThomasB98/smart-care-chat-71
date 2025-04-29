
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { healthTips, healthFAQs } from "@/data/healthData";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HealthTipsProps {
  onSelect: (content: string) => void;
  onClose: () => void;
}

const HealthTips = ({ onSelect, onClose }: HealthTipsProps) => {
  const [activeTab, setActiveTab] = useState("tips");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Health Resources</CardTitle>
        <CardDescription>
          Browse tips and frequently asked questions about health topics.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tips" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tips">Health Tips</TabsTrigger>
            <TabsTrigger value="faqs">FAQ</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tips" className="mt-4">
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <ul className="space-y-4">
                {healthTips.map((tip, index) => (
                  <li key={index}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left p-3 hover:bg-healthcare-light"
                      onClick={() => onSelect(tip)}
                    >
                      <div className="flex items-start">
                        <span className="bg-healthcare-primary text-white h-6 w-6 rounded-full flex items-center justify-center text-xs mr-3 flex-shrink-0">
                          {index + 1}
                        </span>
                        {tip}
                      </div>
                    </Button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="faqs" className="mt-4">
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-4">
                {healthFAQs.map((faq, index) => (
                  <Card key={index} className="border">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base">
                        <Button
                          variant="ghost"
                          className="w-full justify-start p-0 h-auto hover:bg-transparent hover:text-healthcare-primary"
                          onClick={() => onSelect(`Q: ${faq.question}\nA: ${faq.answer}`)}
                        >
                          {faq.question}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-sm">
                      {faq.answer}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </CardFooter>
    </Card>
  );
};

export default HealthTips;
