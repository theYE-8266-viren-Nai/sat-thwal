"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, BookOpen, Clock3, GraduationCap, Users, type LucideIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";
import {
  getAcademicSupportRelationships,
  type AcademicStudentRelationship,
  type AcademicTutorRelationship,
} from "@/lib/serviceFlowData";
import { REQUEST_STATUS_LABEL, REQUEST_STATUS_STYLES } from "@/lib/constants/requestStatus";
import { cn, formatMMK } from "@/lib/utils";

interface AcademicSupportRelationshipsProps {
  profileId: string | null;
}

function initials(name: string | null | undefined) {
  const clean = name?.trim();
  if (!clean) return "ST";
  return clean
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
}

function RelationshipSkeleton() {
  return (
    <div className="px-5 pb-5 md:px-8">
      <div className="h-44 animate-pulse rounded-lg border border-border bg-muted/40" />
    </div>
  );
}

function EmptyPanel({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
  return (
    <div className="flex min-h-28 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-4 text-center">
      <Icon className="mb-2 h-5 w-5 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function TutorCard({ item }: { item: AcademicTutorRelationship }) {
  const tutor = item.tutor;

  return (
    <Card className="flex flex-col gap-4 rounded-lg border-border p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar size="lg">
          {tutor.photo_url && <AvatarImage src={tutor.photo_url} alt={tutor.name} />}
          <AvatarFallback className="bg-brand-indigo/10 font-semibold text-brand-indigo">
            {initials(tutor.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold text-foreground">{tutor.name}</p>
            <Badge className={cn("px-2 text-xs", REQUEST_STATUS_STYLES[item.request.status])}>
              {REQUEST_STATUS_LABEL[item.request.status]}
            </Badge>
          </div>
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{tutor.subjects.join(", ")}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm sm:w-60">
        <div className="rounded-lg bg-secondary/50 px-3 py-2">
          <p className="text-xs text-muted-foreground">Rate</p>
          <p className="font-semibold text-foreground">{formatMMK(tutor.price_per_session)}</p>
        </div>
        <div className="rounded-lg bg-secondary/50 px-3 py-2">
          <p className="text-xs text-muted-foreground">Since</p>
          <p className="font-semibold text-foreground">{formatDate(item.request.created_at)}</p>
        </div>
      </div>
      <Link
        href={`/services/tutor/${tutor.id}`}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border px-4 text-sm font-semibold text-foreground transition hover:bg-secondary"
      >
        View
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </Card>
  );
}

function StudentCard({ item }: { item: AcademicStudentRelationship }) {
  const student = item.student;
  const note = item.request.note?.trim();

  return (
    <Card className="flex flex-col gap-4 rounded-lg border-border p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar size="lg">
          {student.avatar_url && <AvatarImage src={student.avatar_url} alt={student.full_name ?? "Student"} />}
          <AvatarFallback className="bg-brand-mint/10 font-semibold text-brand-mint">
            {initials(student.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold text-foreground">{student.full_name ?? "A student"}</p>
            <Badge className={cn("px-2 text-xs", REQUEST_STATUS_STYLES[item.request.status])}>
              {REQUEST_STATUS_LABEL[item.request.status]}
            </Badge>
          </div>
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
            {student.academic_year ?? "Academic year not set"} - {student.township ?? "Township not set"}
          </p>
        </div>
      </div>
      <div className="grid gap-2 text-sm sm:w-72">
        <div className="rounded-lg bg-secondary/50 px-3 py-2">
          <p className="text-xs text-muted-foreground">Requested</p>
          <p className="font-semibold text-foreground">{formatDate(item.request.created_at)}</p>
        </div>
        {note && <p className="line-clamp-2 text-sm text-muted-foreground">{note}</p>}
      </div>
    </Card>
  );
}

export function AcademicSupportRelationships({ profileId }: AcademicSupportRelationshipsProps) {
  const relationshipsQuery = useQuery({
    queryKey: profileId ? queryKeys.academicSupportRelationships(profileId) : ["academic-support", "relationships", "anonymous"],
    queryFn: () => getAcademicSupportRelationships(createClient(), profileId as string),
    enabled: Boolean(profileId),
  });

  if (!profileId) return null;
  if (relationshipsQuery.isPending) return <RelationshipSkeleton />;

  const relationships = relationshipsQuery.data;
  const myTutors = relationships?.myTutors ?? [];
  const myStudents = relationships?.myStudents ?? [];
  const total = myTutors.length + myStudents.length;

  if (total === 0) return null;

  return (
    <section className="px-5 pb-6 md:px-8">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Your academic connections</h2>
          <p className="text-sm text-muted-foreground">Tutors you learn from and students you support.</p>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-indigo/10 px-3 py-1 font-medium text-brand-indigo">
            <GraduationCap className="h-4 w-4" />
            {myTutors.length} tutor{myTutors.length === 1 ? "" : "s"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-mint/10 px-3 py-1 font-medium text-brand-mint">
            <Users className="h-4 w-4" />
            {myStudents.length} student{myStudents.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <Tabs defaultValue={myTutors.length > 0 ? "tutors" : "students"} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-fit">
          <TabsTrigger value="tutors" className="px-3">
            <BookOpen className="h-4 w-4" />
            My tutors
          </TabsTrigger>
          <TabsTrigger value="students" className="px-3">
            <Users className="h-4 w-4" />
            My students
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tutors" className="mt-3 space-y-3">
          {myTutors.length > 0 ? (
            myTutors.map((item) => <TutorCard key={item.request.id} item={item} />)
          ) : (
            <EmptyPanel icon={Clock3} message="Accepted tutor sessions you request will appear here." />
          )}
        </TabsContent>
        <TabsContent value="students" className="mt-3 space-y-3">
          {myStudents.length > 0 ? (
            myStudents.map((item) => <StudentCard key={item.request.id} item={item} />)
          ) : (
            <EmptyPanel icon={Users} message="Students you accept for tutoring will appear here." />
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}