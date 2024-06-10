"use server";
import supabase from "@/supabase/supabase";

//These functions are specific to my supabase project and save the locations generated in the map example to a table called Map.
//If you want to work with supabase, you will likely need some help getting your database set up on discord.
export async function saveMapCoordinates(locations: any) {
  const { data, error } = await supabase.from("map").insert(locations).select();
  return data;
}

export async function saveConnections(connections: any) {
  const { data, error } = await supabase
    .from("connections")
    .insert(connections)
    .select();
  return data;
}

export async function getMapCoordinates() {
  let { data: map, error } = await supabase.from("map").select("*");
  return map;
}

export async function getLastMapCoordinate() {
  const { data, error } = await supabase
    .from("map")
    .select("*") // Select all columns or specify columns you need
    .order("created_at", { ascending: false }) // Replace 'created_at' with your timestamp column
    .limit(1);

  if (error) {
    console.error("Error fetching last item:", error);
    return;
  }

  console.log("Last item:", data[0]); // data[0] is the last item
  return data[0];
}

export async function getConnectedLocations(id: string, start: boolean = true) {
  let { data: connections, error } = await supabase
    .from("connections")
    .select(`*, map:${start ? "target" : "source"}(*)`)
    .eq(`${start ? "source" : "target"}`, id);
  return connections;
}

export async function getMap() {
  let { data: map, error } = await supabase
    .from("map")
    .select("*")
    .order("created_at", { ascending: false });
  let { data: connections, error: connectionError } = await supabase
    .from("connections")
    .select("*, map_s:source(*), map_e:target(*)");
  return { map, connections };
}
