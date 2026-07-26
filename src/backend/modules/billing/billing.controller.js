import prisma from '../../database/prisma.js';

export const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        planId: true,
        status: true,
      }
    });
    res.json({ success: true, data: subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { companyId, newPlanId } = req.body;
    
    if (!companyId || !newPlanId) {
      return res.status(400).json({ success: false, message: 'Faltan parámetros.' });
    }

    const updated = await prisma.company.update({
      where: { id: parseInt(companyId) },
      data: { planId: newPlanId }
    });

    res.json({ success: true, message: 'Plan actualizado', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
