"use server"

import { promises as fs } from "fs"
import path from "path"

const dataPath = path.join(process.cwd(), "data")

export async function updateSizes(sizes: any[]) {
  try {
    await fs.mkdir(dataPath, { recursive: true })
    await fs.writeFile(path.join(dataPath, "sizes.json"), JSON.stringify(sizes, null, 2))
    return { success: true }
  } catch (error) {
    console.error("Error updating sizes:", error)
    return { success: false, error: "Failed to update sizes" }
  }
}

export async function updateFlavors(flavors: string[]) {
  try {
    await fs.mkdir(dataPath, { recursive: true })
    await fs.writeFile(path.join(dataPath, "flavors.json"), JSON.stringify(flavors, null, 2))
    return { success: true }
  } catch (error) {
    console.error("Error updating flavors:", error)
    return { success: false, error: "Failed to update flavors" }
  }
}

export async function getInitialData() {
  try {
    const sizesData = await fs.readFile(path.join(dataPath, "sizes.json"), "utf-8")
    const flavorsData = await fs.readFile(path.join(dataPath, "flavors.json"), "utf-8")
    return {
      sizes: JSON.parse(sizesData),
      flavors: JSON.parse(flavorsData),
    }
  } catch (error) {
    console.error("Error reading initial data:", error)
    return {
      sizes: [],
      flavors: [],
    }
  }
}

