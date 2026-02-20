"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Member {
  id: string | number;
  name: string;
  email: string;
  joinedAt: string;
  avatar?: string;
}

interface RecentMembersProps {
  members?: Member[];
}

export function RecentMembers({ members = [] }: RecentMembersProps) {
  return (
    <Card className="rounded-sm ">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold">
          Recent Members
        </CardTitle>
      </CardHeader>

      <CardContent>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No members found.
          </p>
        ) : (
          <ScrollArea className="h-[192px] pr-2">
            <div className="divide-y">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-3 hover:bg-muted/50 px-2 rounded-md transition"
                >
                  {/* Left Section */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="text-sm font-medium">
                        {member.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  {/* Right Section */}
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(member.joinedAt), "dd/MM/yyyy")}
                  </p>
                </div>
              ))}
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
