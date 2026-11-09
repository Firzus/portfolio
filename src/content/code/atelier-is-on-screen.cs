using System;
using Firzus.Atelier.Core.Kernel;
using UnityEngine;

[Serializable]
[Title("Is On Screen")]
[Category("Camera/Is On Screen")]
[Description("Passes while the chosen object is inside the main camera's view.")]
[Image("camera")]
public class IsOnScreenCondition : Condition
{
    [SerializeField] private Property<GameObject> _target = new(new GameObjectSelf());

    public override string Title => "Is On Screen";

    protected override bool Evaluate(Context context)
    {
        GameObject target = _target.Get(context);
        Camera camera = Camera.main;
        if (target == null || camera == null) return false;

        Vector3 point = camera.WorldToViewportPoint(target.transform.position);
        return point.z > 0f
            && point.x is >= 0f and <= 1f
            && point.y is >= 0f and <= 1f;
    }
}
